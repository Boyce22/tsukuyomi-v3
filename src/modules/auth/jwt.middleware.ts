import { Request, Response, NextFunction } from 'express';
import { User } from '@/modules/user/entities/user.entity';
import { AuthService } from './auth.service';
import { UnauthorizedError, ForbiddenError } from '@/shared/errors/app-error';
import { Roles } from '@/shared/security/roles.enum';

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
      if (!token) throw new UnauthorizedError('No token provided');

      const decoded = this.authService.verifyAccessToken(token);
      const user = await this.authService.getUserById(decoded.userId);

      if (!user) throw new UnauthorizedError('User not found');
      if (!user.isActive) throw new ForbiddenError('Account is deactivated');

      req.user = user;
      req.userId = user.id;
      next();
    } catch (error) {
      next(error);
    }
  }

  authorize(...allowedRoles: Roles[]) {
    return (req: Request, _res: Response, next: NextFunction): void => {
      try {
        if (!req.user) throw new UnauthorizedError('Authentication required');
        if (!allowedRoles.includes(req.user.role as Roles)) {
          throw new ForbiddenError('Insufficient permissions');
        }
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  private extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return null;
    return authHeader.substring(7);
  }
}

const jwtMiddleware = new JWTMiddleware();

export const authenticate = jwtMiddleware.authenticate.bind(jwtMiddleware);
export const authorize = jwtMiddleware.authorize.bind(jwtMiddleware);
