import { z } from 'zod';
import { HistoryStatus } from '@/shared/enums/history-status';

export const queryReadingHistorySchema = z.object({
  status: z.nativeEnum(HistoryStatus).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export type QueryReadingHistoryInput = z.infer<typeof queryReadingHistorySchema>;
