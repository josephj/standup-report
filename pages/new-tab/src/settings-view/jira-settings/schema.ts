import { z } from 'zod';

export const schema = z.object({
  token: z.string().min(1, 'Token is required'),
  url: z.string().min(1, 'URL is required'),
  inProgressStatuses: z.array(
    z.object({
      value: z.string(),
      label: z.string(),
    }),
  ),
  closedStatuses: z.array(
    z.object({
      value: z.string(),
      label: z.string(),
    }),
  ),
});
