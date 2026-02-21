import { AppError } from "./app-error";

export class BadRequestError extends AppError {
  constructor(message: string, errors?: Array<{ field: string; message: string }>) {
    super(message, 400, errors);
  }
}