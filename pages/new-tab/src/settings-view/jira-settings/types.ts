import type { z } from 'zod';

import type { schema } from './schema';

export type JiraStatus = {
  value: string;
  label: string;
};

export type FormValues = z.infer<typeof schema>;
