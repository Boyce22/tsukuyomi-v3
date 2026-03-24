import { Repository } from 'typeorm';
import { Rating } from '@/modules/manga/entities/rating.entity';
import { PatchRatingInput } from '@/modules/manga/schemas';
import { NotFoundError } from '@errors';

export class RatingRepository {
  constructor(private readonly repository: Repository<Rating>) {}

  async findById(id: string): Promise<Rating | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByUserAndManga(userId: string, mangaId: string): Promise<Rating | null> {
    return this.repository.findOne({ where: { userId, mangaId } });
  }

  async findByManga(mangaId: string, page: number, limit: number): Promise<{ data: Rating[]; total: number }> {
    const [data, total] = await this.repository.findAndCount({
      where: { mangaId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async create(userId: string, mangaId: string, score: number, review?: string): Promise<Rating> {
    const rating = this.repository.create({ userId, mangaId, score, review });
    await this.repository.save(rating);
    return rating;
  }

  async patch(id: string, input: PatchRatingInput): Promise<Rating> {
    const rating = await this.findByIdOrFail(id);
    const filtered = Object.fromEntries(Object.entries(input).filter(([_, v]) => v !== undefined));
    Object.assign(rating, filtered);
    await this.repository.save(rating);
    return rating;
  }

  async delete(id: string): Promise<void> {
    await this.findByIdOrFail(id);
    await this.repository.delete(id);
  }

  async getAverageScore(mangaId: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('rating')
      .select('AVG(rating.score)', 'avg')
      .where('rating.mangaId = :mangaId', { mangaId })
      .getRawOne();
    return parseFloat(result?.avg ?? '0');
  }

  private async findByIdOrFail(id: string): Promise<Rating> {
    const rating = await this.findById(id);
    if (!rating) throw new NotFoundError('Rating not found');
    return rating;
  }
}
