import { AppError } from './app-error';

export class MissingFieldsError extends AppError {
  constructor(message = 'Required fields are missing.') {
    super(message, 400);
  }
}
