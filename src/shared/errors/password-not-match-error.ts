import { AppError } from './app-error';

export class PasswordNotMatchError extends AppError {
  constructor(message = 'Passwords do not match.') {
    super(message, 400);
  }
}
