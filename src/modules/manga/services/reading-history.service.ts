import { Logger } from 'pino';

import { ReadingHistoryRepository } from '@/modules/manga/repositories/reading-history.repository';
import { MangaRepository } from '@/modules/manga/repositories/manga.repository';
import { CreateReadingHistoryInput, PatchReadingHistoryInput, QueryReadingHistoryInput } from '@/modules/manga/schemas';
import { ReadingHistoryResponse } from '@/modules/manga/dtos/reading-history-response.dto';
import { ReadingHistory } from '@/modules/manga/entities/reading-history.entity';

import { PaginatedResponse } from '@/shared/interfaces/api-response.interface';
import { ConflictError, NotFoundError, ForbiddenError } from '@errors';

export class ReadingHistoryService {
  constructor(
    private readonly historyRepository: ReadingHistoryRepository,
    private readonly mangaRepository: MangaRepository,
    private readonly logger: Logger,
  ) {}

  async getHistory(userId: string, query: QueryReadingHistoryInput): Promise<PaginatedResponse<ReadingHistoryResponse>> {
    const { page, limit, status } = query;
    const { data, total } = await this.historyRepository.findByUser(userId, page, limit, status);

    return {
      items: data.map(toReadingHistoryResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getByManga(userId: string, mangaId: string): Promise<ReadingHistoryResponse | null> {
    const history = await this.historyRepository.findByUserAndManga(userId, mangaId);
    return history ? toReadingHistoryResponse(history) : null;
  }

  async createHistory(input: CreateReadingHistoryInput, userId: string): Promise<ReadingHistoryResponse> {
    const manga = await this.mangaRepository.findById(input.mangaId);
    if (!manga) throw new NotFoundError('Manga not found');

    const existing = await this.historyRepository.findByUserAndManga(userId, input.mangaId);
    if (existing) throw new ConflictError('Reading history already exists for this manga');

    const history = await this.historyRepository.create(userId, input.mangaId, input.status);

    this.logger.info({ historyId: history.id, mangaId: input.mangaId }, 'Reading history created');
    return toReadingHistoryResponse(history);
  }

  async patchHistory(id: string, input: PatchReadingHistoryInput, userId: string): Promise<ReadingHistoryResponse> {
    const history = await this.historyRepository.findById(id);
    if (!history) throw new NotFoundError('Reading history not found');

    if (history.userId !== userId) {
      throw new ForbiddenError('You can only edit your own reading history');
    }

    const updated = await this.historyRepository.patch(id, input);

    this.logger.info({ historyId: id }, 'Reading history patched');
    return toReadingHistoryResponse(updated);
  }

  async deleteHistory(id: string, userId: string): Promise<void> {
    const history = await this.historyRepository.findById(id);
    if (!history) throw new NotFoundError('Reading history not found');

    if (history.userId !== userId) {
      throw new ForbiddenError('You can only delete your own reading history');
    }

    await this.historyRepository.delete(id);

    this.logger.info({ historyId: id }, 'Reading history deleted');
  }
}

function toReadingHistoryResponse(history: ReadingHistory): ReadingHistoryResponse {
  return {
    id: history.id,
    mangaId: history.mangaId,
    userId: history.userId,
    status: history.status,
    chaptersRead: history.chaptersRead,
    pagesRead: history.pagesRead,
    lastChapterReadId: history.lastChapterReadId,
    lastPageReadId: history.lastPageReadId,
    lastReadAt: history.lastReadAt?.toISOString(),
    createdAt: history.createdAt.toISOString(),
    updatedAt: history.updatedAt.toISOString(),
  };
}
