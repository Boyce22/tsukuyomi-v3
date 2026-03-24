import { Request, Response, NextFunction, Router } from 'express';

import { RatingService } from '@/modules/manga/services/rating.service';
import { createRatingSchema, patchRatingSchema, queryRatingsSchema } from '@/modules/manga/schemas';

import { authenticate } from '@/modules/auth/jwt.middleware';
import { getAuthUser, validateDto } from '@utils';

export class RatingController {
  public router: Router;
  private ratingService: RatingService;

  constructor(ratingService: RatingService) {
    this.router = Router();
    this.ratingService = ratingService;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', this.getRatings.bind(this));
    this.router.get('/me/:mangaId', authenticate, this.getUserRating.bind(this));
    this.router.post('/', authenticate, this.createRating.bind(this));
    this.router.patch('/:id', authenticate, this.patchRating.bind(this));
    this.router.delete('/:id', authenticate, this.deleteRating.bind(this));
  }

  async getRatings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = validateDto(queryRatingsSchema, req.query);
      const result = await this.ratingService.getRatings(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getUserRating(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = getAuthUser(req);
      const result = await this.ratingService.getUserRating(user.id, req.params['mangaId'] as string);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async createRating(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = validateDto(createRatingSchema, req.body);
      const user = getAuthUser(req);
      const rating = await this.ratingService.createRating(data, user.id);
      res.status(201).json(rating);
    } catch (error) {
      next(error);
    }
  }

  async patchRating(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = validateDto(patchRatingSchema, req.body);
      const user = getAuthUser(req);
      const rating = await this.ratingService.patchRating(req.params['id'] as string, data, user.id, user.role);
      res.json(rating);
    } catch (error) {
      next(error);
    }
  }

  async deleteRating(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = getAuthUser(req);
      await this.ratingService.deleteRating(req.params['id'] as string, user.id, user.role);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
