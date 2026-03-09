import { Request, Response, NextFunction, Router } from 'express';

import { PageService } from '@/modules/manga/services/page.service';
import { patchPageSchema, queryPagesSchema } from '@/modules/manga/schemas';

import { authenticate, authorize } from '@/modules/auth/jwt.middleware';
import { Roles } from '@/shared/security';
import { getAuthUser, validateDto } from '@utils';
import { BadRequestError } from '@errors';
import { UPLOAD_MIDDLEWARE } from '@/shared/storage/upload/upload.config';

export class PageController {
  public router: Router;
  private pageService: PageService;

  constructor(pageService: PageService) {
    this.router = Router();
    this.pageService = pageService;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Public
    this.router.get('/chapter/:chapterId', this.getPages.bind(this));

    // Admin / Moderator
    this.router.post(
      '/chapter/:chapterId',
      authenticate,
      authorize(Roles.ADMIN, Roles.USER),
      UPLOAD_MIDDLEWARE.MANGA_PAGES_ZIP,
      this.uploadPages.bind(this),
    );

    this.router.patch('/:id', authenticate, authorize(Roles.ADMIN, Roles.MODERATOR), this.patchPage.bind(this));

    // Admin only
    this.router.delete('/:id', authenticate, authorize(Roles.ADMIN), this.deletePage.bind(this));
  }

  async getPages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = validateDto(queryPagesSchema, req.query);
      const result = await this.pageService.getPages(req.params['chapterId'] as string, query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async uploadPages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file?.buffer) throw new BadRequestError('No ZIP file provided');

      const pages = await this.pageService.uploadPagesFromZip(
        req.params['chapterId'] as string,
        req.file.buffer,
        getAuthUser(req).id,
      );

      res.status(201).json({ pages });
    } catch (error) {
      next(error);
    }
  }

  async patchPage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = validateDto(patchPageSchema, req.body);
      const page = await this.pageService.patchPage(req.params['id'] as string, data);
      res.json(page);
    } catch (error) {
      next(error);
    }
  }

  async deletePage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.pageService.deletePage(req.params['id'] as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
