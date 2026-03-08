import { Repository } from 'typeorm';
import { Page } from '@/modules/manga/entities/page.entity';
import { Chapter } from '@/modules/manga/entities/chapter.entity';
import { PatchPageInput, QueryPagesInput } from '@/modules/manga/schemas';
import { NotFoundError } from '@errors';

export type NewPageData = {
  number: number;
  imageUrl: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  format?: string;
  hash?: string;
  createdById?: string;
};

export class PageRepository {
  constructor(
    private readonly repository: Repository<Page>,
    private readonly chapterRepository: Repository<Chapter>,
  ) {}

  async findById(id: string): Promise<Page | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByChapter(
    chapterId: string,
    query: QueryPagesInput,
  ): Promise<{ data: Page[]; total: number }> {
    const { page, limit } = query;
    const [data, total] = await this.repository.findAndCount({
      where: { chapterId },
      order: { number: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async getNextPageNumber(chapterId: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('page')
      .select('MAX(page.number)', 'max')
      .where('page.chapterId = :chapterId', { chapterId })
      .getRawOne<{ max: number | null }>();
    return (result?.max ?? 0) + 1;
  }

  async addMany(chapterId: string, pages: NewPageData[]): Promise<Page[]> {
    const entities = pages.map((p) =>
      this.repository.create({ ...p, chapterId } as Partial<Page>),
    );
    const saved = await this.repository.save(entities);
    await this.chapterRepository.increment({ id: chapterId }, 'pageCount', pages.length);
    return saved;
  }

  async patch(id: string, input: PatchPageInput): Promise<Page> {
    const page = await this.findByIdOrFail(id);
    const filtered = Object.fromEntries(Object.entries(input).filter(([_, v]) => v !== undefined));
    Object.assign(page, filtered);
    await this.repository.save(page);
    return page;
  }

  async softDelete(id: string): Promise<void> {
    const page = await this.findByIdOrFail(id);
    await this.repository.softDelete(id);
    await this.chapterRepository.decrement({ id: page.chapterId }, 'pageCount', 1);
  }

  private async findByIdOrFail(id: string): Promise<Page> {
    const page = await this.findById(id);
    if (!page) throw new NotFoundError('Page not found');
    return page;
  }
}
