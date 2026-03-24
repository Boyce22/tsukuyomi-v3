import { z } from 'zod';

export const createFavoriteSchema = z.object({
  mangaId: z.uuid(),
});

export type CreateFavoriteInput = z.infer<typeof createFavoriteSchema>;
