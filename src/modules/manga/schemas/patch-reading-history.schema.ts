import { z } from 'zod';
import { HistoryStatus } from '@/shared/enums/history-status';

export const patchReadingHistorySchema = z.object({
  status: z.nativeEnum(HistoryStatus).optional(),
  lastChapterReadId: z.uuid().optional(),
  lastPageReadId: z.uuid().optional(),
  chaptersRead: z.number().int().min(0).optional(),
  pagesRead: z.number().int().min(0).optional(),
});

export type PatchReadingHistoryInput = z.infer<typeof patchReadingHistorySchema>;
