import { z } from 'zod';
import { HistoryStatus } from '@/shared/enums/history-status';

export const createReadingHistorySchema = z.object({
  mangaId: z.uuid(),
  status: z.nativeEnum(HistoryStatus).default(HistoryStatus.READING),
});

export type CreateReadingHistoryInput = z.infer<typeof createReadingHistorySchema>;
