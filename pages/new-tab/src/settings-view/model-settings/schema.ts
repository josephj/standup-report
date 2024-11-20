import { z } from 'zod';

export const schema = z
  .object({
    useOpenAI: z.boolean(),
    token: z.string().refine(val => !val || val.startsWith('sk-'), {
      message: 'Token must start with sk-',
    }),
    model: z.string(),
  })
  .refine(
    data => {
      if (data.useOpenAI) {
        return !!data.token && !!data.model;
      }
      return true;
    },
    {
      message: 'Token and model are required when using OpenAI',
      path: ['token'], // This will show the error on the token field
    },
  );
