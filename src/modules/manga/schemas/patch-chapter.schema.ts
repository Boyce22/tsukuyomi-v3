import { z } from 'zod';

export const patchChapterSchema = z.object({
  number: z.coerce.number().positive().optional(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  publishedAt: z.coerce.date().optional(),
  isActive: z.coerce.boolean().optional(),
});

export type PatchChapterInput = z.infer<typeof patchChapterSchema>;
