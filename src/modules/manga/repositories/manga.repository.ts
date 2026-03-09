import { In, Repository } from 'typeorm';
import { Manga } from '@/modules/manga/entities/manga.entity';
import { Tag } from '@/modules/manga/entities/tag.entity';
import { Report } from '@/modules/manga/entities/report.entity';
import { CreateMangaInput, PatchMangaInput, QueryMangasInput } from '@/modules/manga/schemas';
import { NotFoundError } from '@errors';

export class MangaRepository {
  constructor(
    private readonly repository: Repository<Manga>,
    private readonly tagRepository: Repository<Tag>,
    private readonly reportRepository: Repository<Report>,
  ) {}

  async findById(id: string): Promise<Manga | null> {
    return this.repository.findOne({ where: { id }, relations: ['tags'] });
  }

  async findBySlug(slug: string): Promise<Manga | null> {
    return this.repository.findOne({ where: { slug }, relations: ['tags'] });
  }

  async findAllPaginated(query: QueryMangasInput): Promise<{ data: Manga[]; total: number }> {
    const { page, limit } = query;

    const qb = this.repository.createQueryBuilder('manga').leftJoinAndSelect('manga.tags', 'tag');

    if (query.search) {
      qb.andWhere('(manga.title ILIKE :search OR manga.description ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    if (query.status) {
      qb.andWhere('manga.status = :status', { status: query.status });
    }

    if (query.isMature !== undefined) {
      qb.andWhere('manga.isMature = :isMature', { isMature: query.isMature });
    }

    qb.orderBy(`manga.${query.sortBy}`, query.order);
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async create(input: CreateMangaInput & { slug: string; createdById?: string; coverUrl?: string }): Promise<Manga> {
    const { tagIds, ...data } = input;
    const manga = this.repository.create(data as Partial<Manga>);

    if (tagIds?.length) {
      manga.tags = await this.tagRepository.find({ where: { id: In(tagIds) } });
    } else {
      manga.tags = [];
    }

    await this.repository.save(manga);
    return (await this.findById(manga.id))!;
  }

  async patch(
    id: string,
    input: PatchMangaInput & { slug?: string; updatedById?: string; coverUrl?: string; bannerUrl?: string },
  ): Promise<Manga> {
    const manga = await this.findByIdOrFail(id);
    const { tagIds, ...data } = input;

    const filtered = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
    Object.assign(manga, filtered);

    if (tagIds !== undefined) {
      manga.tags = tagIds.length ? await this.tagRepository.find({ where: { id: In(tagIds) } }) : [];
    }

    await this.repository.save(manga);
    return (await this.findById(id))!;
  }

  async softDelete(id: string): Promise<void> {
    await this.findByIdOrFail(id);
    await this.repository.softDelete(id);
  }

  async updateCover(id: string, coverUrl: string): Promise<void> {
    await this.repository.update(id, { coverUrl });
  }

  async updateBanner(id: string, bannerUrl: string): Promise<void> {
    await this.repository.update(id, { bannerUrl });
  }

  async createReport(mangaId: string, userId: string, reason: string, description?: string): Promise<void> {
    const report = this.reportRepository.create({
      mangaId,
      userId,
      reason: reason as Report['reason'],
      description,
    });
    await this.reportRepository.save(report);
  }

  async findReport(mangaId: string, userId: string): Promise<Report | null> {
    return this.reportRepository.findOne({ where: { mangaId, userId } });
  }

  async increment(id: string, field: 'commentCount' | 'viewCount' | 'favoriteCount' | 'ratingCount', value: number): Promise<void> {
    await this.repository.increment({ id }, field, value);
  }

  async decrement(id: string, field: 'commentCount' | 'viewCount' | 'favoriteCount' | 'ratingCount', value: number): Promise<void> {
    await this.repository.decrement({ id }, field, value);
  }

  async slugExists(slug: string): Promise<boolean> {
    const count = await this.repository.count({ where: { slug } });
    return count > 0;
  }

  private async findByIdOrFail(id: string): Promise<Manga> {
    const manga = await this.repository.findOne({ where: { id } });
    if (!manga) throw new NotFoundError('Manga not found');
    return manga;
  }
}
