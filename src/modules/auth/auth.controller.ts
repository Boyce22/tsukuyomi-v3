// src/modules/auth/auth.controller.ts
import { Request, Response, NextFunction, Router } from 'express';
import { AuthService } from './auth.service';
import { registerSchema } from './dtos/register.dto';
import { loginSchema } from './dtos/login.dto';
import { refreshTokenSchema } from './dtos/refresh-token.dto';
import { authenticate } from './jwt.middleware';
import { validateDto } from '@/shared/utils/validate-dto';

export class AuthController {
  public router: Router;
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.router = Router();
    this.authService = authService;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/register', this.register.bind(this));
    this.router.post('/login', this.login.bind(this));
    this.router.post('/refresh', this.refreshToken.bind(this));
    this.router.post('/logout', authenticate, this.logout.bind(this));
    this.router.get('/me', authenticate, this.getCurrentUser.bind(this));
  }

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = validateDto(registerSchema, req.body);
      const result = await this.authService.register(data);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = validateDto(loginSchema, req.body);
      const result = await this.authService.login(data);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = validateDto(refreshTokenSchema, req.body);
      const result = await this.authService.refreshToken(refreshToken);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.authService.logout(req.userId!);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        password,
        resetPasswordToken,
        verificationToken,
        refreshToken,
        createdMangas,
        createdChapters,
        createdPages,
        createdTags,
        comments,
        favorites,
        ratings,
        readingHistory,
        ...user
      } = req.user!;

      res.json(user);
    } catch (error) {
      next(error);
    }
  }
}
