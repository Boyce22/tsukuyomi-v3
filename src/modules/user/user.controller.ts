import { Request, Response, NextFunction, Router } from 'express';

import { UserService } from './user.service';
import { Roles } from '@/shared/security/roles.enum';
import { validateDto } from '@/shared/utils/validate-dto';

import { createUserSchema, updateUserSchema, patchUserSchema, changePasswordSchema, queryUsersSchema } from './schemas';

import { authenticate, authorize } from '../auth/jwt.middleware';
import { getAuthUser } from '@/shared/utils/get-authenticated-user';

export class UserController {
  public router: Router;
  private userService: UserService;

  constructor(userService: UserService) {
    this.router = Router();
    this.userService = userService;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/me', authenticate, this.getMe.bind(this));
    this.router.patch('/me', authenticate, this.patchMe.bind(this));
    this.router.put('/me', authenticate, this.updateMe.bind(this));
    this.router.post('/me/change-password', authenticate, this.changePassword.bind(this));

    this.router.post('/', this.createUser.bind(this));
    this.router.get('/', authenticate, this.getUsers.bind(this));
    this.router.get('/:id', authenticate, this.getUserById.bind(this));

    this.router.put('/:id', authenticate, authorize(Roles.ADMIN), this.updateUser.bind(this));
    this.router.patch('/:id', authenticate, authorize(Roles.ADMIN), this.patchUser.bind(this));
    this.router.delete('/:id', authenticate, authorize(Roles.ADMIN), this.deleteUser.bind(this));
    this.router.post('/:id/verify', authenticate, authorize(Roles.ADMIN), this.verifyUser.bind(this));
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await this.userService.getUserById(getAuthUser(req).id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = validateDto(updateUserSchema, req.body);
      const user = await this.userService.updateUserById(getAuthUser(req).id, data);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async patchMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = validateDto(patchUserSchema, req.body);
      const user = await this.userService.patchUserById(getAuthUser(req).id, data);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = validateDto(changePasswordSchema, req.body);
      await this.userService.changePassword(getAuthUser(req).id, data);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = validateDto(queryUsersSchema, req.query);
      const result = await this.userService.getUsers(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await this.userService.getUserById(req.params.id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = validateDto(createUserSchema, req.body);
      const user = await this.userService.createUser(data);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = validateDto(updateUserSchema, req.body);
      const user = await this.userService.updateUserById(req.params.id, data);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async patchUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = validateDto(patchUserSchema, req.body);
      const user = await this.userService.patchUserById(req.params.id, data);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.userService.softDeleteUserById(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async verifyUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await this.userService.verifyUser(req.params.id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
}
