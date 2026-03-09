import path from 'path';
import crypto from 'crypto';
import AdmZip from 'adm-zip';
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

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

export class PageService {
  private readonly compressor = new ImageCompressionService();

  constructor(
    private readonly pageRepository: PageRepository,
    private readonly chapterRepository: ChapterRepository,
    private readonly logger: Logger,
  ) {}

  async getPages(chapterId: string, query: QueryPagesInput): Promise<PaginatedResponse<PageResponse>> {
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

  async uploadPagesFromZip(chapterId: string, zipBuffer: Buffer, createdById?: string): Promise<PageResponse[]> {
    const chapter = await this.chapterRepository.findById(chapterId);
    if (!chapter) throw new NotFoundError('Chapter not found');

    const entries = extractImageEntries(zipBuffer);
    if (!entries.length) throw new BadRequestError('No valid image files found in the ZIP');

    const storage = getStorageProvider();
    const startNumber = await this.pageRepository.getNextPageNumber(chapterId);

    const uploadResults = await Promise.all(
      entries.map(async ({ name, buffer: rawBuffer }, index) => {
        const mime = mimeFromExtension(path.extname(name));
        const compressed = await this.compressor.compress(rawBuffer, QualityCompress.HIGH, mime);

        const meta = await sharp(compressed.buffer).metadata();
        const hash = crypto.createHash('sha256').update(compressed.buffer).digest('hex');
        const ext = path.extname(name);
        const pageNumber = startNumber + index;

        const uploaded = await storage.upload(compressed.buffer, {
          folder: `mangas/chapters/${chapterId}`,
          filename: `page-${pageNumber}${ext}`,
        });

        return {
          number: pageNumber,
          imageUrl: uploaded.url,
          thumbnailUrl: uploaded.thumbnailUrl,
          width: meta.width,
          height: meta.height,
          fileSize: compressed.buffer.byteLength,
          format: meta.format ?? ext.replace('.', ''),
          hash,
          createdById,
        };
      }),
    );

    const pages = await this.pageRepository.addMany(chapterId, uploadResults);
    this.logger.info({ chapterId, count: pages.length }, 'Pages uploaded from ZIP');
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

function extractImageEntries(zipBuffer: Buffer): { name: string; buffer: Buffer }[] {
  const zip = new AdmZip(zipBuffer);

  return zip
    .getEntries()
    .filter((entry) => {
      if (entry.isDirectory) return false;
      const ext = path.extname(entry.entryName).toLowerCase();
      return IMAGE_EXTENSIONS.has(ext);
    })
    .sort((a, b) => naturalSort(a.entryName, b.entryName))
    .map((entry) => ({
      name: path.basename(entry.entryName),
      buffer: entry.getData(),
    }));
}

function mimeFromExtension(ext: string): string {
  const map: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
  };

  return map[ext.toLowerCase()] ?? 'image/jpeg';
}

function naturalSort(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
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
