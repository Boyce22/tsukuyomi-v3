import { Request, Response, NextFunction } from 'express';
import { User } from '@/modules/user/entities/user.entity';
import { AuthService } from './auth.service';
import { AppError } from '@errors';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      userId?: string;
    }
  }
}

export class JWTMiddleware {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
    try {
      const token = this.extractToken(req);
      if (!token) throw new AppError('No token provided', 401);

      const decoded = this.authService.verifyAccessToken(token);
      const user = await this.authService.getUserById(decoded.userId);

      if (!user) throw new AppError('User not found', 401);

      req.user = user;
      req.userId = user.id;
      next();
    } catch (error) {
      next(error);
    }
  }

  async optionalAuthenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
    try {
      const token = this.extractToken(req);
      if (!token) return next();

      const decoded = this.authService.verifyAccessToken(token);
      const user = await this.authService.getUserById(decoded.userId);

      if (user) {
        req.user = user;
        req.userId = user.id;
      }
    } catch {
      // Silently fail for optional auth
    } finally {
      next();
    }
  }

  authorize(...allowedRoles: string[]) {
    return (req: Request, _res: Response, next: NextFunction): void => {
      if (!req.user) throw new AppError('Authentication required', 401);

      if (!allowedRoles.includes(req.user.role)) {
        throw new AppError('Insufficient permissions', 403);
      }
      
      next();
    };
  }

  private extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return null;
    return authHeader.substring(7);
  }
}

export const jwtMiddleware = new JWTMiddleware();
export const authenticate = jwtMiddleware.authenticate.bind(jwtMiddleware);
export const optionalAuthenticate = jwtMiddleware.optionalAuthenticate.bind(jwtMiddleware);
export const authorize = jwtMiddleware.authorize.bind(jwtMiddleware);
