import { z } from 'zod';

export const createChapterSchema = z.object({
  mangaId: z.uuid(),
  number: z.coerce.number().positive(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  publishedAt: z.coerce.date().optional(),
});

export type CreateChapterInput = z.infer<typeof createChapterSchema>;
