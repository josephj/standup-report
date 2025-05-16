import type { z } from 'zod';
import type { schema } from './schema';
import type { ChatCompletionCreateParams } from 'groq-sdk/resources/chat/completions';

export type RequestBody = z.infer<typeof schema>;

export type ErrorResponse = {
  error: {
    message: string;
    type: string;
    param?: string;
    code?: string;
  };
};

export type ChatCompletionOptions = ChatCompletionCreateParams;
