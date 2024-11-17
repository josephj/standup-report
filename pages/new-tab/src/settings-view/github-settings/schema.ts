import { z } from 'zod';

export const schema = z.object({
  token: z.string().min(1, 'Token is required'),
  useSpecificRepos: z.boolean(),
  selectedRepos: z.array(
    z.object({
      value: z.string(),
      label: z.string(),
    }),
  ),
});
