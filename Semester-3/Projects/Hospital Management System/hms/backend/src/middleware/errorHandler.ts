import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError.js';

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export const notFoundHandler = (
  request: Request,
  response: Response<ApiErrorResponse>,
): void => {
  response.status(404).json({
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `No route exists for ${request.method} ${request.originalUrl}`,
    },
  });
};

export const errorHandler = (
  error: unknown,
  _request: Request,
  response: Response<ApiErrorResponse>,
  _next: NextFunction,
): void => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error.details !== undefined ? { details: error.details } : {}),
      },
    });
    return;
  }

  console.error(error);
  response.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected server error occurred.',
    },
  });
};
