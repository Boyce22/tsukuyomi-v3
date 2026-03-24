import { Logger } from 'pino';

import { FavoriteRepository } from '@/modules/manga/repositories/favorite.repository';
import { MangaRepository } from '@/modules/manga/repositories/manga.repository';
import { FavoriteResponse } from '@/modules/manga/dtos/favorite-response.dto';
import { Favorite } from '@/modules/manga/entities/favorite.entity';

import { PaginatedResponse } from '@/shared/interfaces/api-response.interface';
import { ConflictError, NotFoundError } from '@errors';

export class FavoriteService {
  constructor(
    private readonly favoriteRepository: FavoriteRepository,
    private readonly mangaRepository: MangaRepository,
    private readonly logger: Logger,
  ) {}

  async getFavorites(userId: string, page: number, limit: number): Promise<PaginatedResponse<FavoriteResponse>> {
    const { data, total } = await this.favoriteRepository.findByUser(userId, page, limit);

    return {
      items: data.map(toFavoriteResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async checkFavorite(userId: string, mangaId: string): Promise<{ isFavorited: boolean }> {
    const favorite = await this.favoriteRepository.findByUserAndManga(userId, mangaId);
    return { isFavorited: !!favorite };
  }

  async addFavorite(mangaId: string, userId: string): Promise<FavoriteResponse> {
    const manga = await this.mangaRepository.findById(mangaId);
    if (!manga) throw new NotFoundError('Manga not found');

    const existing = await this.favoriteRepository.findByUserAndManga(userId, mangaId);
    if (existing) throw new ConflictError('Manga is already favorited');

    const favorite = await this.favoriteRepository.create(userId, mangaId);
    await this.mangaRepository.increment(mangaId, 'favoriteCount', 1);

    this.logger.info({ favoriteId: favorite.id, mangaId }, 'Favorite added');
    return toFavoriteResponse(favorite);
  }

  async removeFavorite(mangaId: string, userId: string): Promise<void> {
    const favorite = await this.favoriteRepository.findByUserAndManga(userId, mangaId);
    if (!favorite) throw new NotFoundError('Favorite not found');

    await this.favoriteRepository.delete(favorite.id);
    await this.mangaRepository.decrement(mangaId, 'favoriteCount', 1);

    this.logger.info({ mangaId }, 'Favorite removed');
  }
}

function toFavoriteResponse(favorite: Favorite): FavoriteResponse {
  return {
    id: favorite.id,
    mangaId: favorite.mangaId,
    userId: favorite.userId,
    createdAt: favorite.createdAt.toISOString(),
  };
}
