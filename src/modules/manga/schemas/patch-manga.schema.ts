import { createMangaSchema } from './create-manga.schema';

export const patchMangaSchema = createMangaSchema.partial();

export type PatchMangaInput = Partial<import('./create-manga.schema').CreateMangaInput>;
