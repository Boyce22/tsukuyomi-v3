import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import { Logger } from 'pino';

import { PageRepository } from '@/modules/manga/repositories/page.repository';
import { ChapterRepository } from '@/modules/manga/repositories/chapter.repository';
import { PatchPageInput, QueryPagesInput } from '@/modules/manga/schemas';
import { PageResponse } from '@/modules/manga/dtos/chapter-response.dto';
import { Page } from '@/modules/manga/entities/page.entity';

import { PaginatedResponse } from '@/shared/interfaces/api-response.interface';
import { getStorageProvider } from '@/shared/storage/storage.factory';
import { ImageCompressionService } from '@/shared/storage/compressor.service';
import { QualityCompress } from '@/shared/storage/interfaces/compressor.interface';

import { BadRequestError, NotFoundError } from '@errors';

export class PageService {
  private readonly compressor = new ImageCompressionService();

  constructor(
    private readonly pageRepository: PageRepository,
    private readonly chapterRepository: ChapterRepository,
    private readonly logger: Logger,
  ) {}

  async getPages(
    chapterId: string,
    query: QueryPagesInput,
  ): Promise<PaginatedResponse<PageResponse>> {
    const chapter = await this.chapterRepository.findById(chapterId);
    if (!chapter) throw new NotFoundError('Chapter not found');

    const { data, total } = await this.pageRepository.findByChapter(chapterId, query);
    const { page, limit } = query;

    return {
      items: data.map(toPageResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async uploadPages(
    chapterId: string,
    files: Express.Multer.File[],
    createdById?: string,
  ): Promise<PageResponse[]> {
    const chapter = await this.chapterRepository.findById(chapterId);
    if (!chapter) throw new NotFoundError('Chapter not found');
    if (!files.length) throw new BadRequestError('No pages provided');

    const storage = getStorageProvider();
    const startNumber = await this.pageRepository.getNextPageNumber(chapterId);

    const uploadResults = await Promise.all(
      files.map(async (file, index) => {
        const filePath = file.path;
        if (!filePath) throw new BadRequestError(`Page ${index + 1}: file path not available`);

        let compressedBuffer: Buffer;
        try {
          const compressed = await this.compressor.compress(
            filePath,
            QualityCompress.HIGH,
            file.mimetype,
          );
          compressedBuffer = compressed.buffer;
        } finally {
          await fs.unlink(filePath).catch(() => undefined);
        }

        const meta = await sharp(compressedBuffer).metadata();
        const hash = crypto.createHash('sha256').update(compressedBuffer).digest('hex');
        const ext = path.extname(file.originalname) || '.jpg';
        const pageNumber = startNumber + index;

        const uploaded = await storage.upload(compressedBuffer, {
          folder: `mangas/chapters/${chapterId}`,
          filename: `page-${pageNumber}${ext}`,
        });

        return {
          number: pageNumber,
          imageUrl: uploaded.url,
          thumbnailUrl: uploaded.thumbnailUrl,
          width: meta.width,
          height: meta.height,
          fileSize: compressedBuffer.byteLength,
          format: meta.format ?? ext.replace('.', ''),
          hash,
          createdById,
        };
      }),
    );

    const pages = await this.pageRepository.addMany(chapterId, uploadResults);
    this.logger.info({ chapterId, count: pages.length }, 'Pages uploaded');
    return pages.map(toPageResponse);
  }

  async patchPage(id: string, input: PatchPageInput): Promise<PageResponse> {
    const page = await this.pageRepository.findById(id);
    if (!page) throw new NotFoundError('Page not found');

    const updated = await this.pageRepository.patch(id, input);
    this.logger.info({ pageId: id }, 'Page patched');
    return toPageResponse(updated);
  }

  async deletePage(id: string): Promise<void> {
    const page = await this.pageRepository.findById(id);
    if (!page) throw new NotFoundError('Page not found');
    await this.pageRepository.softDelete(id);
    this.logger.info({ pageId: id }, 'Page deleted');
  }
}

export function toPageResponse(page: Page): PageResponse {
  return {
    id: page.id,
    chapterId: page.chapterId,
    number: page.number,
    imageUrl: page.imageUrl,
    thumbnailUrl: page.thumbnailUrl,
    width: page.width,
    height: page.height,
    fileSize: page.fileSize,
    format: page.format,
  };
}
