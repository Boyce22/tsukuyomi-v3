import { Request, Response, NextFunction, Router } from 'express';
import { TagService } from '@/modules/manga/services/tag.service';
import { createTagSchema, patchTagSchema, queryTagsSchema } from '@/modules/manga/schemas';
import { authenticate, authorize } from '@/modules/auth/jwt.middleware';
import { Roles } from '@/shared/security';
import { getAuthUser, validateDto } from '@utils';

export class TagController {
  public router: Router;
  private tagService: TagService;

  constructor(tagService: TagService) {
    this.router = Router();
    this.tagService = tagService;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', this.getTags.bind(this));
    this.router.get('/:id', this.getTagById.bind(this));

    this.router.post('/', authenticate, authorize(Roles.ADMIN, Roles.MODERATOR), this.createTag.bind(this));
    this.router.patch('/:id', authenticate, authorize(Roles.ADMIN, Roles.MODERATOR), this.patchTag.bind(this));

    this.router.delete('/:id', authenticate, authorize(Roles.ADMIN), this.deleteTag.bind(this));
  }

  async getTags(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = validateDto(queryTagsSchema, req.query);
      const result = await this.tagService.getTags(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getTagById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tag = await this.tagService.getTagById(req.params['id'] as string);
      res.json(tag);
    } catch (error) {
      next(error);
    }
  }

  async createTag(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = validateDto(createTagSchema, req.body);
      const tag = await this.tagService.createTag(data, getAuthUser(req).id);
      res.status(201).json(tag);
    } catch (error) {
      next(error);
    }
  }

  async patchTag(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = validateDto(patchTagSchema, req.body);
      const tag = await this.tagService.patchTag(req.params['id'] as string, data, getAuthUser(req).id);
      res.json(tag);
    } catch (error) {
      next(error);
    }
  }

  async deleteTag(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.tagService.deleteTag(req.params['id'] as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
