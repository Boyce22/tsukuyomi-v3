import { Repository } from 'typeorm';
import { Chapter } from '@/modules/manga/entities/chapter.entity';
import { CreateChapterInput, PatchChapterInput, QueryChaptersInput } from '@/modules/manga/schemas';
import { NotFoundError } from '@errors';

export class ChapterRepository {
  constructor(private readonly repository: Repository<Chapter>) {}

  async findById(id: string): Promise<Chapter | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByMangaAndNumber(mangaId: string, number: number): Promise<Chapter | null> {
    return this.repository.findOne({ where: { mangaId, number } });
  }

  async findAllByManga(
    mangaId: string,
    query: QueryChaptersInput,
  ): Promise<{ data: Chapter[]; total: number }> {
    const { page, limit, order } = query;
    const [data, total] = await this.repository.findAndCount({
      where: { mangaId },
      order: { number: order },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async create(
    input: CreateChapterInput & { slug: string; createdById?: string },
  ): Promise<Chapter> {
    const chapter = this.repository.create(input as Partial<Chapter>);
    await this.repository.save(chapter);
    return (await this.findById(chapter.id))!;
  }

  async patch(id: string, input: PatchChapterInput & { slug?: string; updatedById?: string }): Promise<Chapter> {
    const chapter = await this.findByIdOrFail(id);
    const filtered = Object.fromEntries(Object.entries(input).filter(([_, v]) => v !== undefined));
    Object.assign(chapter, filtered);
    await this.repository.save(chapter);
    return chapter;
  }

  async softDelete(id: string): Promise<void> {
    await this.findByIdOrFail(id);
    await this.repository.softDelete(id);
  }

  async numberExists(mangaId: string, number: number): Promise<boolean> {
    const count = await this.repository.count({ where: { mangaId, number } });
    return count > 0;
  }

  async increment(id: string, field: 'pageCount', value: number): Promise<void> {
    await this.repository.increment({ id }, field, value);
  }

  async decrement(id: string, field: 'pageCount', value: number): Promise<void> {
    await this.repository.decrement({ id }, field, value);
  }

  private async findByIdOrFail(id: string): Promise<Chapter> {
    const chapter = await this.findById(id);
    if (!chapter) throw new NotFoundError('Chapter not found');
    return chapter;
  }
}
