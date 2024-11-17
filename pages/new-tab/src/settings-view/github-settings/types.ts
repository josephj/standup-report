import type { z } from 'zod';

import type { schema } from './schema';

export type Option = {
  value: string;
  label: string;
};

export type FormValues = z.infer<typeof schema>;
