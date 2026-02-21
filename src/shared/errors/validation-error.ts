import { AppError } from "./app-error";

export class ValidationError extends AppError {
  constructor(errors: Array<{ field: string; message: string }>) {
    super('Validation failed', 400, errors);
  }
}