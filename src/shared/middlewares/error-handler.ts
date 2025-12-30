import { env } from '@config';
import { logger } from '@utils';
import { AppError } from '@errors';
import { Request, Response, NextFunction } from 'express';

interface ErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  stack?: string;
}

const ERROR_STATUS_MAP: Record<string, number> = {
  QueryFailedError: 400,
  EntityNotFoundError: 404,
  JsonWebTokenError: 401,
  TokenExpiredError: 401,
  ValidationError: 400,
  MulterError: 400,
};

export const errorHandler = (
  error: Error | AppError,
  request: Request,
  response: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof SyntaxError && 'body' in error) {
    statusCode = 400;
    message = 'Invalid JSON';
  } else if (ERROR_STATUS_MAP[error.name]) {
    statusCode = ERROR_STATUS_MAP[error.name];
  }

  const errorResponse: ErrorResponse = {
    success: false,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    path: request.path,
  };

  if (env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
  }

  if (statusCode >= 500) {
    logger.error('Server error', {
      message: error.message,
      statusCode,
      method: request.method,
      path: request.path,
      stack: error.stack,
    });
  } else {
    logger.warn('Client error', {
      message: error.message,
      statusCode,
      method: request.method,
      path: request.path,
    });
  }

  response.status(statusCode).json(errorResponse);
};
