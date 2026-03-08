import { z } from 'zod';

export const queryPagesSchema = z.object({
  page: z.coerce.number().int().positive().min(1).default(1),
  limit: z.coerce.number().int().positive().max(100).min(1).default(20),
});

export type QueryPagesInput = z.infer<typeof queryPagesSchema>;
