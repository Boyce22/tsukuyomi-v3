import { z } from 'zod';
import { ReportReason } from '@/modules/manga/entities/report.entity';

export const reportMangaSchema = z.object({
  reason: z.enum(ReportReason),
  description: z.string().max(500).optional(),
});

export type ReportMangaInput = z.infer<typeof reportMangaSchema>;
