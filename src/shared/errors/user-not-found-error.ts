import { AppError } from './app-error';

export class UserNotFoundError extends AppError {
  constructor(message = 'User not found.') {
    super(message, 404);
  }
}
