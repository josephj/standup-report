// enhanced-handler.ts
import type { Response } from '@google-cloud/functions-framework';
import type { Groq } from 'groq-sdk';
import type { ChatCompletion } from 'groq-sdk/resources/chat/completions';
import type { ChatCompletionOptions } from './types';
import { retrieveRelevantChunks, storeEmbeddings, splitText } from './embedding-service';
import { v4 as uuidv4 } from 'uuid';

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

export const handleLongContentResponse = async (
  res: Response,
  groq: Groq,
  options: ChatCompletionOptions,
  origin: string | undefined,
) => {
  try {
    const userMessages = options.messages.filter(msg => msg.role === 'user');
    const lastUserMessage = userMessages[userMessages.length - 1].content;

    const systemMessages = options.messages.filter(msg => msg.role === 'system');
    const previousMessages = options.messages.filter(
      (msg, idx) => msg.role !== 'system' && idx < options.messages.length - 1,
    );

    const conversationId = uuidv4();

    if (previousMessages.length > 0) {
      const combinedHistory = previousMessages.map(msg => `[${msg.role}]: ${msg.content}`).join('\n\n');

      const chunks = splitText(combinedHistory);
      await storeEmbeddings(conversationId, chunks, 24);
    }

    const relevantChunks = await retrieveRelevantChunks(lastUserMessage, conversationId);

    const enhancedMessages = [
      ...systemMessages,
      {
        role: 'system' as const,
        content: `Previous relevant conversation context:\n\n${relevantChunks.join('\n\n')}`,
      },
      {
        role: 'user' as const,
        content: lastUserMessage,
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
