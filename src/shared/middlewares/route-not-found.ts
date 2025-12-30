import { AppError } from '@errors';

export class RouteNotFound extends AppError {
  constructor(method: string, path: string) {
    const message = `Route ${method} ${path} not found`
    super(message, 404);
  }
}
