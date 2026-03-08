import { z } from 'zod';
import { MangaStatus } from '@/shared/enums/manga-status';

export const queryMangasSchema = z.object({
  page: z.coerce.number().int().positive().min(1).default(1),
  limit: z.coerce.number().int().positive().max(100).min(1).default(20),
  search: z.string().optional(),
  status: z.enum(MangaStatus).optional(),
  isMature: z.coerce.boolean().default(false).optional(),
  sortBy: z
    .enum(['title', 'createdAt', 'updatedAt', 'averageRating', 'viewCount'])
    .default('createdAt'),
  order: z.enum(['ASC', 'DESC']).default('DESC'),
});

export type QueryMangasInput = z.infer<typeof queryMangasSchema>;
