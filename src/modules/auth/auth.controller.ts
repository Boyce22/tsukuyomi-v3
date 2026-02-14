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

  constructor() {
    this.router = Router();
    this.authService = new AuthService();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/register', this.register);
    this.router.post('/login', this.login);
    this.router.post('/refresh', this.refreshToken);
    this.router.get('/me', authenticate, this.getCurrentUser);
  }

  private register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = validateDto(registerSchema, req.body);
      const result = await this.authService.register(data);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  private login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = validateDto(loginSchema, req.body);
      const result = await this.authService.login(data);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  private refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = validateDto(refreshTokenSchema, req.body);
      const result = await this.authService.refreshToken(refreshToken);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  private getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { password, resetPasswordToken, verificationToken, ...user } = req.user!;
      res.json(user);
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();

export const authRouter = authController.router;
