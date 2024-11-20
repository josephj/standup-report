import type { z } from 'zod';

import type { schema } from './schema';

export type FormValues = z.infer<typeof schema>;
