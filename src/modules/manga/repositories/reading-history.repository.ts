import { Repository } from 'typeorm';
import { ReadingHistory } from '@/modules/manga/entities/reading-history.entity';
import { PatchReadingHistoryInput } from '@/modules/manga/schemas';
import { HistoryStatus } from '@/shared/enums/history-status';
import { NotFoundError } from '@errors';

export class ReadingHistoryRepository {
  constructor(private readonly repository: Repository<ReadingHistory>) {}

  async findById(id: string): Promise<ReadingHistory | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByUserAndManga(userId: string, mangaId: string): Promise<ReadingHistory | null> {
    return this.repository.findOne({ where: { userId, mangaId } });
  }

  async findByUser(
    userId: string,
    page: number,
    limit: number,
    status?: HistoryStatus,
  ): Promise<{ data: ReadingHistory[]; total: number }> {
    const where: Record<string, unknown> = { userId };
    if (status) where.status = status;

    const [data, total] = await this.repository.findAndCount({
      where,
      order: { updatedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async create(userId: string, mangaId: string, status: HistoryStatus): Promise<ReadingHistory> {
    const history = this.repository.create({ userId, mangaId, status, lastReadAt: new Date() });
    await this.repository.save(history);
    return history;
  }

  async patch(id: string, input: PatchReadingHistoryInput): Promise<ReadingHistory> {
    const history = await this.findByIdOrFail(id);
    const filtered = Object.fromEntries(Object.entries(input).filter(([_, v]) => v !== undefined));
    Object.assign(history, filtered);
    history.lastReadAt = new Date();
    await this.repository.save(history);
    return history;
  }

  async delete(id: string): Promise<void> {
    await this.findByIdOrFail(id);
    await this.repository.delete(id);
  }

  private async findByIdOrFail(id: string): Promise<ReadingHistory> {
    const history = await this.findById(id);
    if (!history) throw new NotFoundError('Reading history not found');
    return history;
  }
}
