import { Request, Response, NextFunction, Router } from 'express';

import { ReadingHistoryService } from '@/modules/manga/services/reading-history.service';
import { createReadingHistorySchema, patchReadingHistorySchema, queryReadingHistorySchema } from '@/modules/manga/schemas';

import { authenticate } from '@/modules/auth/jwt.middleware';
import { getAuthUser, validateDto } from '@utils';

export class ReadingHistoryController {
  public router: Router;
  private historyService: ReadingHistoryService;

  constructor(historyService: ReadingHistoryService) {
    this.router = Router();
    this.historyService = historyService;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', authenticate, this.getHistory.bind(this));
    this.router.get('/manga/:mangaId', authenticate, this.getByManga.bind(this));
    this.router.post('/', authenticate, this.createHistory.bind(this));
    this.router.patch('/:id', authenticate, this.patchHistory.bind(this));
    this.router.delete('/:id', authenticate, this.deleteHistory.bind(this));
  }

  async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = getAuthUser(req);
      const query = validateDto(queryReadingHistorySchema, req.query);
      const result = await this.historyService.getHistory(user.id, query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getByManga(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = getAuthUser(req);
      const result = await this.historyService.getByManga(user.id, req.params['mangaId'] as string);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async createHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = validateDto(createReadingHistorySchema, req.body);
      const user = getAuthUser(req);
      const history = await this.historyService.createHistory(data, user.id);
      res.status(201).json(history);
    } catch (error) {
      next(error);
    }
  }

  async patchHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = validateDto(patchReadingHistorySchema, req.body);
      const user = getAuthUser(req);
      const history = await this.historyService.patchHistory(req.params['id'] as string, data, user.id);
      res.json(history);
    } catch (error) {
      next(error);
    }
  }

  async deleteHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = getAuthUser(req);
      await this.historyService.deleteHistory(req.params['id'] as string, user.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
