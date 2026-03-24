import { Request, Response, NextFunction, Router } from 'express';

import { FavoriteService } from '@/modules/manga/services/favorite.service';
import { createFavoriteSchema, queryFavoritesSchema } from '@/modules/manga/schemas';

import { authenticate } from '@/modules/auth/jwt.middleware';
import { getAuthUser, validateDto } from '@utils';

export class FavoriteController {
  public router: Router;
  private favoriteService: FavoriteService;

  constructor(favoriteService: FavoriteService) {
    this.router = Router();
    this.favoriteService = favoriteService;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', authenticate, this.getFavorites.bind(this));
    this.router.get('/check/:mangaId', authenticate, this.checkFavorite.bind(this));
    this.router.post('/', authenticate, this.addFavorite.bind(this));
    this.router.delete('/:mangaId', authenticate, this.removeFavorite.bind(this));
  }

  async getFavorites(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = getAuthUser(req);
      const { page, limit } = validateDto(queryFavoritesSchema, req.query);
      const result = await this.favoriteService.getFavorites(user.id, page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async checkFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = getAuthUser(req);
      const result = await this.favoriteService.checkFavorite(user.id, req.params['mangaId'] as string);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async addFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { mangaId } = validateDto(createFavoriteSchema, req.body);
      const user = getAuthUser(req);
      const favorite = await this.favoriteService.addFavorite(mangaId, user.id);
      res.status(201).json(favorite);
    } catch (error) {
      next(error);
    }
  }

  async removeFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = getAuthUser(req);
      await this.favoriteService.removeFavorite(req.params['mangaId'] as string, user.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
