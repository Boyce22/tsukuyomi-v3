import { Logger } from 'pino';

import { RatingRepository } from '@/modules/manga/repositories/rating.repository';
import { MangaRepository } from '@/modules/manga/repositories/manga.repository';
import { CreateRatingInput, PatchRatingInput, QueryRatingsInput } from '@/modules/manga/schemas';
import { RatingResponse } from '@/modules/manga/dtos/rating-response.dto';
import { Rating } from '@/modules/manga/entities/rating.entity';

import { PaginatedResponse } from '@/shared/interfaces/api-response.interface';
import { Roles } from '@/shared/security';
import { ConflictError, ForbiddenError, NotFoundError } from '@errors';

export class RatingService {
  constructor(
    private readonly ratingRepository: RatingRepository,
    private readonly mangaRepository: MangaRepository,
    private readonly logger: Logger,
  ) {}

  async getRatings(query: QueryRatingsInput): Promise<PaginatedResponse<RatingResponse>> {
    const { mangaId, page, limit } = query;
    const { data, total } = await this.ratingRepository.findByManga(mangaId, page, limit);

    return {
      items: data.map(toRatingResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserRating(userId: string, mangaId: string): Promise<RatingResponse | null> {
    const rating = await this.ratingRepository.findByUserAndManga(userId, mangaId);
    return rating ? toRatingResponse(rating) : null;
  }

  async createRating(input: CreateRatingInput, userId: string): Promise<RatingResponse> {
    const manga = await this.mangaRepository.findById(input.mangaId);
    if (!manga) throw new NotFoundError('Manga not found');

    const existing = await this.ratingRepository.findByUserAndManga(userId, input.mangaId);
    if (existing) throw new ConflictError('You already rated this manga');

    const rating = await this.ratingRepository.create(userId, input.mangaId, input.score, input.review);
    await this.mangaRepository.increment(input.mangaId, 'ratingCount', 1);
    await this.updateMangaAverage(input.mangaId);

    this.logger.info({ ratingId: rating.id, mangaId: input.mangaId }, 'Rating created');
    return toRatingResponse(rating);
  }

  async patchRating(id: string, input: PatchRatingInput, userId: string, userRole: Roles): Promise<RatingResponse> {
    const rating = await this.ratingRepository.findById(id);
    if (!rating) throw new NotFoundError('Rating not found');

    const isPrivileged = userRole === Roles.ADMIN || userRole === Roles.OWNER;
    if (rating.userId !== userId && !isPrivileged) {
      throw new ForbiddenError('You can only edit your own ratings');
    }

    const updated = await this.ratingRepository.patch(id, input);
    await this.updateMangaAverage(rating.mangaId);

    this.logger.info({ ratingId: id }, 'Rating patched');
    return toRatingResponse(updated);
  }

  async deleteRating(id: string, userId: string, userRole: Roles): Promise<void> {
    const rating = await this.ratingRepository.findById(id);
    if (!rating) throw new NotFoundError('Rating not found');

    const isPrivileged = userRole === Roles.ADMIN || userRole === Roles.OWNER;
    if (rating.userId !== userId && !isPrivileged) {
      throw new ForbiddenError('You can only delete your own ratings');
    }

    await this.ratingRepository.delete(id);
    await this.mangaRepository.decrement(rating.mangaId, 'ratingCount', 1);
    await this.updateMangaAverage(rating.mangaId);

    this.logger.info({ ratingId: id }, 'Rating deleted');
  }

  private async updateMangaAverage(mangaId: string): Promise<void> {
    const avg = await this.ratingRepository.getAverageScore(mangaId);
    await this.mangaRepository.updateAverageRating(mangaId, avg);
  }
}

function toRatingResponse(rating: Rating): RatingResponse {
  return {
    id: rating.id,
    score: Number(rating.score),
    review: rating.review,
    mangaId: rating.mangaId,
    userId: rating.userId,
    createdAt: rating.createdAt.toISOString(),
    updatedAt: rating.updatedAt.toISOString(),
  };
}
