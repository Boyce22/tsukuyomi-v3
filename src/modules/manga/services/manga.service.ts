import path from 'path';
import { Logger } from 'pino';

import { MangaRepository } from '@/modules/manga/repositories/manga.repository';
import { CreateMangaInput, PatchMangaInput, QueryMangasInput, ReportMangaInput } from '@/modules/manga/schemas';
import { MangaResponse, TagResponse } from '@/modules/manga/dtos/manga-response.dto';
import { Manga } from '@/modules/manga/entities/manga.entity';
import { Tag } from '@/modules/manga/entities/tag.entity';

import { PaginatedResponse } from '@/shared/interfaces/api-response.interface';
import { getStorageProvider } from '@/shared/storage/storage.factory';

import { BadRequestError, ConflictError, NotFoundError } from '@errors';

export class MangaService {
  constructor(
    private readonly mangaRepository: MangaRepository,
    private readonly logger: Logger,
  ) {}

  async getMangas(query: QueryMangasInput): Promise<PaginatedResponse<MangaResponse>> {
    const { data, total } = await this.mangaRepository.findAllPaginated(query);
    const { page, limit } = query;

    return {
      items: data.map(toMangaResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getMangaBySlug(slug: string): Promise<MangaResponse> {
    const manga = await this.mangaRepository.findBySlug(slug);
    if (!manga) throw new NotFoundError('Manga not found');
    return toMangaResponse(manga);
  }

  async getMangaById(id: string): Promise<MangaResponse> {
    const manga = await this.mangaRepository.findById(id);
    if (!manga) throw new NotFoundError('Manga not found');
    return toMangaResponse(manga);
  }

  async createManga(input: CreateMangaInput, createdById?: string): Promise<MangaResponse> {
    const slug = await this.generateUniqueSlug(input.title);

    const manga = await this.mangaRepository.create({
      ...input,
      slug,
      createdById,
      coverUrl: '',
    });

    this.logger.info({ mangaId: manga.id }, 'Manga created');
    return toMangaResponse(manga);
  }

  async patchManga(id: string, input: PatchMangaInput, updatedById?: string): Promise<MangaResponse> {
    const existing = await this.mangaRepository.findById(id);
    if (!existing) throw new NotFoundError('Manga not found');

    const patchData: PatchMangaInput & { slug?: string; updatedById?: string } = {
      ...input,
      updatedById,
    };

    if (input.title && input.title !== existing.title) {
      patchData.slug = await this.generateUniqueSlug(input.title);
    }

    const manga = await this.mangaRepository.patch(id, patchData);
    this.logger.info({ mangaId: id }, 'Manga patched');
    return toMangaResponse(manga);
  }

  async deleteManga(id: string): Promise<void> {
    const manga = await this.mangaRepository.findById(id);
    if (!manga) throw new NotFoundError('Manga not found');
    await this.mangaRepository.softDelete(id);
    this.logger.info({ mangaId: id }, 'Manga deleted');
  }

  async uploadCover(id: string, file: Express.Multer.File): Promise<string> {
    const manga = await this.mangaRepository.findById(id);
    if (!manga) throw new NotFoundError('Manga not found');

    const storage = getStorageProvider();
    const result = await storage.upload(file.buffer, {
      folder: `mangas/${id}/cover`,
      filename: `${Date.now()}${path.extname(file.originalname)}`,
      maxWidth: 800,
      maxHeight: 1200,
      quality: 90,
    });

    await this.mangaRepository.updateCover(id, result.url);
    this.logger.info({ mangaId: id, url: result.url }, 'Manga cover updated');
    return result.url;
  }

  async uploadBanner(id: string, file: Express.Multer.File): Promise<string> {
    const manga = await this.mangaRepository.findById(id);
    if (!manga) throw new NotFoundError('Manga not found');

    const storage = getStorageProvider();
    const result = await storage.upload(file.buffer, {
      folder: `mangas/${id}/banner`,
      filename: `${Date.now()}${path.extname(file.originalname)}`,
      maxWidth: 2560,
      maxHeight: 720,
      quality: 90,
    });

    await this.mangaRepository.updateBanner(id, result.url);
    this.logger.info({ mangaId: id, url: result.url }, 'Manga banner updated');
    return result.url;
  }

  async reportManga(mangaId: string, userId: string, input: ReportMangaInput): Promise<void> {
    const manga = await this.mangaRepository.findById(mangaId);
    if (!manga) throw new NotFoundError('Manga not found');

    const existing = await this.mangaRepository.findReport(mangaId, userId);
    if (existing) throw new ConflictError('You have already reported this manga');

    await this.mangaRepository.createReport(mangaId, userId, input.reason, input.description);
    this.logger.info({ mangaId, userId, reason: input.reason }, 'Manga reported');
  }

  private async generateUniqueSlug(title: string): Promise<string> {
    const base = slugify(title);
    let slug = base;
    let attempt = 0;

    while (await this.mangaRepository.slugExists(slug)) {
      attempt++;
      slug = `${base}-${attempt}`;
    }

    return slug;
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toTagResponse(tag: Tag): TagResponse {
  return {
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    type: tag.type,
    color: tag.color,
  };
}

export function toMangaResponse(manga: Manga): MangaResponse {
  return {
    id: manga.id,
    title: manga.title,
    slug: manga.slug,
    description: manga.description,
    coverUrl: manga.coverUrl,
    bannerUrl: manga.bannerUrl,
    isMature: manga.isMature,
    status: manga.status,
    publicationDate: manga.publicationDate,
    completionDate: manga.completionDate,
    averageRating: Number(manga.averageRating),
    ratingCount: manga.ratingCount,
    viewCount: manga.viewCount,
    favoriteCount: manga.favoriteCount,
    commentCount: manga.commentCount,
    chapterCount: manga.chapterCount,
    author: manga.author,
    artist: manga.artist,
    publisher: manga.publisher,
    alternativeTitles: manga.alternativeTitles,
    originalLanguage: manga.originalLanguage,
    tags: (manga.tags ?? []).map(toTagResponse),
    createdAt: manga.createdAt.toISOString(),
    updatedAt: manga.updatedAt.toISOString(),
  };
}
