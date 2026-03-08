import { Request, Response, NextFunction, Router } from 'express';

import { MangaService } from '@/modules/manga/services/manga.service';
import { createMangaSchema, patchMangaSchema, queryMangasSchema, reportMangaSchema } from '@/modules/manga/schemas';

import { authenticate, authorize } from '@/modules/auth/jwt.middleware';
import { Roles } from '@/shared/security';
import { getAuthUser, validateDto } from '@utils';
import { BadRequestError } from '@errors';
import { UPLOAD_MIDDLEWARE } from '@/shared/storage/upload/upload.config';

export class MangaController {
  public router: Router;
  private mangaService: MangaService;

  constructor(mangaService: MangaService) {
    this.router = Router();
    this.mangaService = mangaService;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', this.getMangas.bind(this));
    this.router.get('/:slug', this.getMangaBySlug.bind(this));

    this.router.post('/:id/report', authenticate, this.reportManga.bind(this));

    this.router.post('/', authenticate, authorize(Roles.ADMIN, Roles.USER), this.createManga.bind(this));

    this.router.patch('/:id', authenticate, authorize(Roles.ADMIN, Roles.MODERATOR), this.patchManga.bind(this));

    this.router.post(
      '/:id/cover',
      authenticate,
      authorize(Roles.ADMIN, Roles.MODERATOR),
      UPLOAD_MIDDLEWARE.MANGA_COVER,
      this.uploadCover.bind(this),
    );

    this.router.post(
      '/:id/banner',
      authenticate,
      authorize(Roles.ADMIN, Roles.MODERATOR),
      UPLOAD_MIDDLEWARE.BANNER,
      this.uploadBanner.bind(this),
    );

    this.router.delete('/:id', authenticate, authorize(Roles.ADMIN), this.deleteManga.bind(this));
  }

  async getMangas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = validateDto(queryMangasSchema, req.query);
      const result = await this.mangaService.getMangas(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMangaBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const manga = await this.mangaService.getMangaBySlug(req.params['slug'] as string);
      res.json(manga);
    } catch (error) {
      next(error);
    }
  }

  async createManga(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = validateDto(createMangaSchema, req.body);
      const manga = await this.mangaService.createManga(data, getAuthUser(req).id);
      res.status(201).json(manga);
    } catch (error) {
      next(error);
    }
  }

  async patchManga(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = validateDto(patchMangaSchema, req.body);
      const manga = await this.mangaService.patchManga(req.params['id'] as string, data, getAuthUser(req).id);
      res.json(manga);
    } catch (error) {
      next(error);
    }
  }

  async deleteManga(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.mangaService.deleteManga(req.params['id'] as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async uploadCover(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) throw new BadRequestError('No file provided');
      const coverUrl = await this.mangaService.uploadCover(req.params['id'] as string, req.file);
      res.json({ coverUrl });
    } catch (error) {
      next(error);
    }
  }

  async uploadBanner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) throw new BadRequestError('No file provided');
      const bannerUrl = await this.mangaService.uploadBanner(req.params['id'] as string, req.file);
      res.json({ bannerUrl });
    } catch (error) {
      next(error);
    }
  }

  async reportManga(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = validateDto(reportMangaSchema, req.body);
      await this.mangaService.reportManga(req.params['id'] as string, getAuthUser(req).id, data);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
