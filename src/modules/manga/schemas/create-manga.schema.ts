import { z } from 'zod';
import { MangaStatus } from '@/shared/enums/manga-status';

export const createMangaSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  isMature: z.coerce.boolean().default(false),
  status: z.enum(MangaStatus).default(MangaStatus.ACTIVED),
  publicationDate: z.coerce.date().optional(),
  author: z.string().max(255).optional(),
  artist: z.string().max(255).optional(),
  publisher: z.string().max(255).optional(),
  alternativeTitles: z.preprocess(
    (v) => (typeof v === 'string' ? v.split(',').map((s) => s.trim()).filter(Boolean) : v),
    z.array(z.string()).optional(),
  ),
  originalLanguage: z.string().max(10).default('ja'),
  tagIds: z.preprocess(
    (v) => (typeof v === 'string' ? [v] : v),
    z.array(z.uuid()).optional(),
  ),
});

export type CreateMangaInput = z.infer<typeof createMangaSchema>;
