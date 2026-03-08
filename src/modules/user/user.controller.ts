import { Roles } from '@/shared/security';
import { getAuthUser, validateDto } from '@utils';

import { BadRequestError } from '@errors';

import { Request, Response, NextFunction, Router } from 'express';

import { UserService } from '@/modules/user/user.service';

import {
  createUserSchema,
  patchUserSchema,
  changePasswordSchema,
  queryUsersSchema,
  updateUserSchema,
} from '@/modules/user/schemas';
import { authenticate, authorize } from '@/modules/auth/jwt.middleware';

import { CountryService } from '@/modules/country/country.service';

import { UPLOAD_MIDDLEWARE } from '@/shared/storage/upload/upload.config';

export class UserController {
  public router: Router;
  private userService: UserService;
  private countryService: CountryService;

  constructor(userService: UserService, countryService: CountryService) {
    this.router = Router();
    this.userService = userService;
    this.countryService = countryService;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/me', authenticate, this.getMe.bind(this));
    this.router.put('/me', authenticate, this.updateMe.bind(this));
    this.router.patch('/me', authenticate, this.patchMe.bind(this));
    this.router.post('/me/change-password', authenticate, this.changePassword.bind(this));

    this.router.post(
      '/me/profile-picture',
      authenticate,
      UPLOAD_MIDDLEWARE.PROFILE_PICTURE,
      this.changeProfilePicture.bind(this),
    );

    this.router.post('/me/banner', authenticate, UPLOAD_MIDDLEWARE.BANNER, this.changeBanner.bind(this));

    // Rotas públicas e listagem
    this.router.post('/', this.createUser.bind(this));
    this.router.get('/', authenticate, this.getUsers.bind(this));
    this.router.get('/:id', authenticate, this.getUserById.bind(this));

    // Rotas administrativas
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
      const { address: addressIds, ...userData } = data;

      const address = await this.countryService.validateAndBuildAddress(addressIds);
      const user = await this.userService.updateUserById(getAuthUser(req).id, userData, address);

      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async patchMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = validateDto(patchUserSchema, req.body);
      const { address: addressIds, ...userData } = data;

      const address = await this.countryService.validateAndBuildAddress(addressIds);
      const user = await this.userService.patchUserById(getAuthUser(req).id, userData, address);

      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async changeProfilePicture(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) throw new BadRequestError('No file provided');
      const profilePictureUrl = await this.userService.updateProfilePicture(getAuthUser(req).id, req.file);
      res.json({ profilePictureUrl });
    } catch (error) {
      next(error);
    }
  }

  async changeBanner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) throw new BadRequestError('No file provided');
      const bannerUrl = await this.userService.updateBanner(getAuthUser(req).id, req.file);
      res.json({ bannerUrl });
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
      const user = await this.userService.getUserById(req.params.id as string);
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

  async patchUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = validateDto(patchUserSchema, req.body);
      const { address: addressIds, ...userData } = data;

      const address = await this.countryService.validateAndBuildAddress(addressIds);
      const user = await this.userService.patchUserById(req.params.id as string, userData, address);

      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.userService.softDeleteUserById(req.params.id as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async verifyUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await this.userService.verifyUser(req.params.id as string);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
}
