import { z } from 'zod';
import { Request, Response, NextFunction, Router } from 'express';

import { CommentService } from '@/modules/manga/services/comment.service';
import { createCommentSchema, patchCommentSchema, queryCommentsSchema } from '@/modules/manga/schemas';

import { authenticate, authorize } from '@/modules/auth/jwt.middleware';
import { getAuthUser, validateDto } from '@utils';
import { Roles } from '@security';

const queryRepliesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

const queryTreeSchema = z.object({
  mangaId: z.uuid(),
  chapterId: z.uuid().optional(),
});

export class CommentController {
  public router: Router;
  private commentService: CommentService;

  constructor(commentService: CommentService) {
    this.router = Router();
    this.commentService = commentService;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Public
    this.router.get('/', this.getComments.bind(this));
    this.router.get('/:id/replies', this.getCommentReplies.bind(this));
    
    this.router.get('/tree', authenticate, authorize(Roles.ADMIN, Roles.USER), this.getCommentTree.bind(this));
    // Any authenticated user
    this.router.post('/', authenticate, this.createComment.bind(this));
    this.router.patch('/:id', authenticate, this.patchComment.bind(this));
    this.router.delete('/:id', authenticate, this.deleteComment.bind(this));
  }

  async getCommentTree(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { mangaId, chapterId } = validateDto(queryTreeSchema, req.query);
      const result = await this.commentService.getCommentTree(mangaId, chapterId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getCommentReplies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = validateDto(queryRepliesSchema, req.query);
      const result = await this.commentService.getCommentReplies(req.params['id'] as string, page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getComments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = validateDto(queryCommentsSchema, req.query);
      const result = await this.commentService.getComments(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async createComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = validateDto(createCommentSchema, req.body);
      const user = getAuthUser(req);
      const comment = await this.commentService.createComment(data, user.id);
      res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  }

  async patchComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = validateDto(patchCommentSchema, req.body);
      const user = getAuthUser(req);
      const comment = await this.commentService.patchComment(req.params['id'] as string, data, user.id, user.role);
      res.json(comment);
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = getAuthUser(req);
      await this.commentService.deleteComment(req.params['id'] as string, user.id, user.role);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
