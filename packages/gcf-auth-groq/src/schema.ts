import { z } from 'zod';

export const schema = z.object({
  model: z.string().default('llama-3.1-8b-instant'),
  messages: z
    .array(
      z.object({
        role: z.enum(['system', 'user', 'assistant']),
        content: z.union([
          z.string(),
          z.array(
            z.object({
              type: z.enum(['text', 'image_url']),
              text: z.string().optional(),
              image_url: z
                .object({
                  url: z.string(),
                })
                .optional(),
            }),
          ),
        ]),
      }),
    )
    .min(1, 'Messages array cannot be empty'),
  stream: z.boolean().default(false),
  temperature: z.number().min(0, 'Temperature must be at least 0').max(2, 'Temperature must be at most 2').default(0),
  max_tokens: z.number().optional(),
  reasoning_format: z.string().optional(),
});
