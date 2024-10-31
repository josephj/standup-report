import type { Response } from '@google-cloud/functions-framework';
import type { Groq } from 'groq-sdk';
import type { ChatCompletion } from 'groq-sdk/resources/chat/completions';
import type { ChatCompletionOptions } from './types';

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
