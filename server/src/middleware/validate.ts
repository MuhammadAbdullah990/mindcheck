import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny, z } from 'zod';

/**
 * Validates `req.body` against a Zod schema, replacing it with the parsed
 * result so downstream handlers receive coerced, typed, trusted data.
 * (Prisma would reject a `number` passed where it expects an int, but the
 * point is to never hand handlers a value the client shouldn't be able to set.)
 */
export function validateBody<T extends ZodTypeAny>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(result.error);
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery<T extends ZodTypeAny>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(result.error);
      return;
    }
    // Express 5 exposes `query` via a getter in some versions; assign through
    // a mutable alias to stay compatible.
    (req as Request & { validatedQuery?: z.infer<T> }).validatedQuery = result.data;
    next();
  };
}
