import { Logger } from 'pino';

import { ChapterRepository } from '@/modules/manga/repositories/chapter.repository';
import { MangaRepository } from '@/modules/manga/repositories/manga.repository';
import {
  CreateChapterInput,
  PatchChapterInput,
  QueryChaptersInput,
} from '@/modules/manga/schemas';
import { ChapterResponse } from '@/modules/manga/dtos/chapter-response.dto';
import { Chapter } from '@/modules/manga/entities/chapter.entity';

import { PaginatedResponse } from '@/shared/interfaces/api-response.interface';

import { ConflictError, NotFoundError } from '@errors';

export class ChapterService {
  constructor(
    private readonly chapterRepository: ChapterRepository,
    private readonly mangaRepository: MangaRepository,
    private readonly logger: Logger,
  ) {}

  async getChapters(
    mangaId: string,
    query: QueryChaptersInput,
  ): Promise<PaginatedResponse<ChapterResponse>> {
    const manga = await this.mangaRepository.findById(mangaId);
    if (!manga) throw new NotFoundError('Manga not found');

    const { data, total } = await this.chapterRepository.findAllByManga(mangaId, query);
    const { page, limit } = query;

    return {
      items: data.map(toChapterResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getChapterById(id: string): Promise<ChapterResponse> {
    const chapter = await this.chapterRepository.findById(id);
    if (!chapter) throw new NotFoundError('Chapter not found');
    return toChapterResponse(chapter);
  }

  async createChapter(input: CreateChapterInput, createdById?: string): Promise<ChapterResponse> {
    const manga = await this.mangaRepository.findById(input.mangaId);
    if (!manga) throw new NotFoundError('Manga not found');

    const exists = await this.chapterRepository.numberExists(input.mangaId, input.number);
    if (exists) throw new ConflictError(`Chapter ${input.number} already exists for this manga`);

    const slug = generateChapterSlug(manga.slug, input.number);
    const chapter = await this.chapterRepository.create({ ...input, slug, createdById });

    this.logger.info({ chapterId: chapter.id, mangaId: input.mangaId }, 'Chapter created');
    return toChapterResponse(chapter);
  }

  async patchChapter(
    id: string,
    input: PatchChapterInput,
    updatedById?: string,
  ): Promise<ChapterResponse> {
    const chapter = await this.chapterRepository.findById(id);
    if (!chapter) throw new NotFoundError('Chapter not found');

    if (input.number && input.number !== chapter.number) {
      const exists = await this.chapterRepository.numberExists(chapter.mangaId, input.number);
      if (exists) throw new ConflictError(`Chapter ${input.number} already exists for this manga`);
    }

    const updated = await this.chapterRepository.patch(id, { ...input, updatedById });
    this.logger.info({ chapterId: id }, 'Chapter patched');
    return toChapterResponse(updated);
  }

  async deleteChapter(id: string): Promise<void> {
    const chapter = await this.chapterRepository.findById(id);
    if (!chapter) throw new NotFoundError('Chapter not found');
    await this.chapterRepository.softDelete(id);
    this.logger.info({ chapterId: id }, 'Chapter deleted');
  }
}

function generateChapterSlug(mangaSlug: string, number: number): string {
  return `${mangaSlug}-chapter-${number}`;
}

export function toChapterResponse(chapter: Chapter): ChapterResponse {
  return {
    id: chapter.id,
    mangaId: chapter.mangaId,
    number: chapter.number,
    title: chapter.title,
    slug: chapter.slug,
    description: chapter.description,
    publishedAt: chapter.publishedAt?.toISOString(),
    viewCount: chapter.viewCount,
    pageCount: chapter.pageCount,
    commentCount: chapter.commentCount,
    isActive: chapter.isActive,
    createdAt: chapter.createdAt.toISOString(),
    updatedAt: chapter.updatedAt.toISOString(),
  };
}
