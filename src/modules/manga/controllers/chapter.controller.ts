import { Request, Response, NextFunction, Router } from 'express';

import { ChapterService } from '@/modules/manga/services/chapter.service';
import { createChapterSchema, patchChapterSchema, queryChaptersSchema } from '@/modules/manga/schemas';

import { authenticate, authorize } from '@/modules/auth/jwt.middleware';
import { Roles } from '@/shared/security';
import { getAuthUser, validateDto } from '@utils';

export class ChapterController {
  public router: Router;
  private chapterService: ChapterService;

  constructor(chapterService: ChapterService) {
    this.router = Router();
    this.chapterService = chapterService;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Public
    this.router.get('/manga/:mangaId', this.getChapters.bind(this));
    this.router.get('/:id', this.getChapterById.bind(this));

    // Admin / Moderator
    this.router.post('/', authenticate, authorize(Roles.ADMIN, Roles.MODERATOR), this.createChapter.bind(this));

    this.router.patch('/:id', authenticate, authorize(Roles.ADMIN, Roles.MODERATOR), this.patchChapter.bind(this));

    // Admin only
    this.router.delete('/:id', authenticate, authorize(Roles.ADMIN), this.deleteChapter.bind(this));
  }

  async getChapters(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = validateDto(queryChaptersSchema, req.query);
      const result = await this.chapterService.getChapters(req.params['mangaId'] as string, query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getChapterById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const chapter = await this.chapterService.getChapterById(req.params['id'] as string);
      res.json(chapter);
    } catch (error) {
      next(error);
    }
  }

  async createChapter(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = validateDto(createChapterSchema, req.body);
      const chapter = await this.chapterService.createChapter(data, getAuthUser(req).id);
      res.status(201).json(chapter);
    } catch (error) {
      next(error);
    }
  }

  async patchChapter(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = validateDto(patchChapterSchema, req.body);
      const chapter = await this.chapterService.patchChapter(req.params['id'] as string, data, getAuthUser(req).id);
      res.json(chapter);
    } catch (error) {
      next(error);
    }
  }

  async deleteChapter(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.chapterService.deleteChapter(req.params['id'] as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
