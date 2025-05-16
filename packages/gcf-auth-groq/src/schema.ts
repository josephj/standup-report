import { z } from 'zod';
import type {
  ChatCompletionUserMessageParam,
  ChatCompletionContentPartImage,
} from 'groq-sdk/resources/chat/completions';

export const schema = z.object({
  model: z.string().default('llama-3.1-8b-instant'),
  messages: z
    .array(
      z.object({
        role: z.enum(['system', 'user', 'assistant']),
        content: z.union([
          z.string(),
          z.array(
            z.union([
              z.object({
                type: z.literal('text'),
                text: z.string(),
              }),
              z.object({
                type: z.literal('image_url'),
                image_url: z.object({
                  url: z.string(),
                }),
              }) satisfies z.ZodType<ChatCompletionContentPartImage>,
            ]),
          ) satisfies z.ZodType<ChatCompletionUserMessageParam['content']>,
        ]),
      }),
    )
    .min(1, 'Messages array cannot be empty'),
  stream: z.boolean().default(false),
  temperature: z.number().min(0, 'Temperature must be at least 0').max(2, 'Temperature must be at most 2').default(0),
  max_tokens: z.number().optional(),
  reasoning_format: z.string().optional(),
});
