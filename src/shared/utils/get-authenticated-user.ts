import { Request } from 'express';
import { User } from '@/modules/user/entities/user.entity';
import { AppError } from '@errors';

export function getAuthUser(req: Request): User {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }
  return req.user;
}