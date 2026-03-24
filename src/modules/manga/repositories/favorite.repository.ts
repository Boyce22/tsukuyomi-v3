import { Repository } from 'typeorm';
import { Favorite } from '@/modules/manga/entities/favorite.entity';

export class FavoriteRepository {
  constructor(private readonly repository: Repository<Favorite>) {}

  async findById(id: string): Promise<Favorite | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByUserAndManga(userId: string, mangaId: string): Promise<Favorite | null> {
    return this.repository.findOne({ where: { userId, mangaId } });
  }

  async findByUser(userId: string, page: number, limit: number): Promise<{ data: Favorite[]; total: number }> {
    const [data, total] = await this.repository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async create(userId: string, mangaId: string): Promise<Favorite> {
    const favorite = this.repository.create({ userId, mangaId });
    await this.repository.save(favorite);
    return favorite;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
