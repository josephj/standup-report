import type { z } from 'zod';
import type { schema } from './schema';

export type RequestBody = z.infer<typeof schema>;

export type ErrorResponse = {
  error: {
    message: string;
    type: string;
    param?: string;
    code?: string;
  };
};

type ChatCompletionMessageRole = 'system' | 'user' | 'assistant';

type ContentItem = {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
  };
};

export type ChatCompletionOptions = {
  model: string;
  messages: Array<{
    role: ChatCompletionMessageRole;
    content: string | ContentItem[];
  }>;
  temperature: number;
  stream: boolean;
  max_tokens?: number;
};
