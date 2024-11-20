import { z } from 'zod';

export const schema = z.object({
  excludeKeywords: z.array(z.string()),
});
