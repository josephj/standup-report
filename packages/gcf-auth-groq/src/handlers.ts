import type { Response } from '@google-cloud/functions-framework';
import type { Groq } from 'groq-sdk';
import type { ChatCompletion } from 'groq-sdk/resources/chat/completions';
import type { ChatCompletionOptions } from './types';
import { retrieveRelevantChunks, storeEmbeddings, splitText } from './embedding-service';
import { v4 as uuidv4 } from 'uuid';
import { get_encoding } from 'tiktoken';

export const handleStreamResponse = async (
  res: Response,
  groq: Groq,
  options: ChatCompletionOptions,
  origin: string | undefined,
) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': origin || '*',
  });

  try {
    const stream = await groq.chat.completions.create({
      ...options,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
  } catch (streamError) {
    console.error('Stream error:', streamError);
    const error = streamError as Error;
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
  } finally {
    res.end();
  }
};

export const handleRegularResponse = async (res: Response, groq: Groq, options: ChatCompletionOptions) => {
  const chatCompletion = (await groq.chat.completions.create(options)) as ChatCompletion;

  res.json({
    id: chatCompletion.id,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: chatCompletion.model,
    choices: [
      {
        index: 0,
        message: chatCompletion.choices[0].message,
        finish_reason: chatCompletion.choices[0].finish_reason,
      },
    ],
    usage: chatCompletion.usage,
  });
};

const countTokens = (text: string): number => {
  try {
    const encoder = get_encoding('cl100k_base');
    const tokens = encoder.encode(text);
    const count = tokens.length;
    encoder.free();
    return count;
  } catch (error) {
    console.warn('Tiktoken error, falling back to estimate:', error);
    return Math.ceil(text.length / 4);
  }
};

const simplifyChunk = async (groq: Groq, chunk: string): Promise<string> => {
  const response = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `Simplify the following text by:
- Removing redundant or repetitive phrases and words
- Maintaining all unique information, facts, and data points
- Preserving the original meaning and context
- Keeping names, technical terms, and specific details intact
- Using clearer sentence structures where possible
Do not summarize or omit unique information.`,
      },
      {
        role: 'user',
        content: chunk,
      },
    ],
    model: 'mixtral-8x7b-32768',
    temperature: 0.3,
    max_tokens: 1500,
  });

  return response.choices[0].message.content ?? '';
};

export const handleLongContentResponse = async (
  res: Response,
  groq: Groq,
  options: ChatCompletionOptions,
  origin: string | undefined,
) => {
  try {
    const MAX_TOTAL_TOKENS = 4500;
    const TOKEN_MARGIN = 500;
    const CHUNK_SIZE = 4000;
    const conversationId = uuidv4();

    const userMessages = options.messages.filter(msg => msg.role === 'user');
    const lastUserMessage = userMessages[userMessages.length - 1].content;
    const systemMessages = options.messages.filter(msg => msg.role === 'system');
    const previousMessages = options.messages.filter(
      (msg, idx) => msg.role !== 'system' && idx < options.messages.length - 1,
    );

    const isInitialTranscript = previousMessages.length === 0 && userMessages.length === 1;
    const userMessageTokens = countTokens(lastUserMessage);
    const systemTokens = systemMessages.reduce((sum, msg) => sum + countTokens(msg.content), 0);
    const availableTokens = MAX_TOTAL_TOKENS - systemTokens - TOKEN_MARGIN;

    if (isInitialTranscript && userMessageTokens > availableTokens) {
      console.log(`Processing initial long transcript (${userMessageTokens} tokens) using parallel simplification`);

      const chunks = splitText(lastUserMessage, CHUNK_SIZE);
      console.log(`Split transcript into ${chunks.length} chunks`);

      await storeEmbeddings(conversationId, chunks, 24);

      const simplified = await Promise.all(chunks.map(chunk => simplifyChunk(groq, chunk)));

      let processedContent = simplified.join('\n\n');
      let processedTokens = countTokens(processedContent);

      if (processedTokens > availableTokens) {
        console.log(
          `Combined simplified text still exceeds limit: ${processedTokens}/${availableTokens}. Simplifying again...`,
        );
        processedContent = await simplifyChunk(groq, processedContent);
        processedTokens = countTokens(processedContent);
      }

      if (processedTokens > availableTokens) {
        const encoder = get_encoding('cl100k_base');
        try {
          const tokens = encoder.encode(processedContent);
          const truncatedTokens = tokens.slice(0, availableTokens);
          processedContent = new TextDecoder().decode(truncatedTokens);
        } finally {
          encoder.free();
        }
      }

      console.log(`Final processed transcript: ${countTokens(processedContent)}/${availableTokens} tokens`);

      const enhancedMessages = [
        ...systemMessages,
        {
          role: 'user' as const,
          content: processedContent,
        },
      ];

      const enhancedOptions = {
        ...options,
        messages: enhancedMessages,
      };

      if (options.stream) {
        return handleStreamResponse(res, groq, enhancedOptions, origin);
      } else {
        return handleRegularResponse(res, groq, enhancedOptions);
      }
    } else {
      if (previousMessages.length > 0) {
        const combinedHistory = previousMessages.map(msg => `[${msg.role}]: ${msg.content}`).join('\n\n');
        const chunks = splitText(combinedHistory);
        await storeEmbeddings(conversationId, chunks, 24);
      }

      let processedUserMessage = lastUserMessage;

      if (userMessageTokens > availableTokens / 2) {
        console.log(`Large user message detected (${userMessageTokens} tokens)`);

        const userMsgChunks = splitText(lastUserMessage);
        await storeEmbeddings(`${conversationId}-user-msg`, userMsgChunks, 24);

        const relevantUserChunks = await retrieveRelevantChunks(
          userMsgChunks[userMsgChunks.length - 1],
          `${conversationId}-user-msg`,
          3,
        );

        processedUserMessage = relevantUserChunks.join('\n\n');

        if (countTokens(processedUserMessage) > availableTokens / 2) {
          const encoder = get_encoding('cl100k_base');
          try {
            const tokens = encoder.encode(processedUserMessage);
            const truncatedTokens = tokens.slice(0, Math.floor(availableTokens / 2));
            processedUserMessage = new TextDecoder().decode(truncatedTokens);
          } finally {
            encoder.free();
          }
        }
      }

      const contextChunks = await retrieveRelevantChunks(processedUserMessage, conversationId);
      let contextContent = contextChunks.join('\n\n');

      const processedUserTokens = countTokens(processedUserMessage);
      const remainingTokens = availableTokens - processedUserTokens;

      if (countTokens(contextContent) > remainingTokens) {
        const encoder = get_encoding('cl100k_base');
        try {
          const tokens = encoder.encode(contextContent);
          const truncatedTokens = tokens.slice(0, remainingTokens);
          contextContent = new TextDecoder().decode(truncatedTokens);
        } finally {
          encoder.free();
        }
      }

      const enhancedMessages = [
        ...systemMessages,
        {
          role: 'system' as const,
          content: `Previous relevant conversation context:\n\n${contextContent}`,
        },
        {
          role: 'user' as const,
          content: processedUserMessage,
        },
      ];

      const enhancedOptions = {
        ...options,
        messages: enhancedMessages,
      };

      const totalTokens = systemTokens + countTokens(contextContent) + processedUserTokens;
      console.log(
        `Token usage: System=${systemTokens}, Context=${countTokens(contextContent)}, User=${processedUserTokens}, Total=${totalTokens}`,
      );

      if (options.stream) {
        return handleStreamResponse(res, groq, enhancedOptions, origin);
      } else {
        return handleRegularResponse(res, groq, enhancedOptions);
      }
    }
  } catch (error) {
    console.error('Error in embedding processing:', error);
    const err = error as Error;

    if (options.stream) {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': origin || '*',
      });
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    } else {
      res.status(500).json({
        error: {
          message: `Embedding processing failed: ${err.message}`,
          type: 'embedding_error',
        },
      });
    }
  }
};
