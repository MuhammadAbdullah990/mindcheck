import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/errors.js';
import { isProd } from '../config/env.js';

/** Wrap an async handler so rejected promises reach the error middleware. */
export function asyncHandler<T extends Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as T, res, next)).catch(next);
  };
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `No route matches ${req.method} ${req.originalUrl}`,
    },
  });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // Express identifies the error handler by this 4-arg signature; `next` must
  // stay in the signature even though it is unused.
  _next: NextFunction,
) {
  // Zod validation failure → field-level details
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: err.issues.map((i) => ({
          field: i.path.join('.') || '(root)',
          message: i.message,
        })),
      },
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
    return;
  }

  // Unique constraint violation (e.g. duplicate email, or re-answering the
  // same question in one session) → 409 rather than a 500.
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message: 'That record already exists',
      },
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Resource not found',
      },
    });
    return;
  }

  // Anything unrecognised is a bug on our side. Log the detail, return nothing
  // sensitive — stack traces can leak schema and file paths.
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: isProd
        ? 'Something went wrong on our end'
        : err instanceof Error
          ? err.message
          : String(err),
    },
  });
}
