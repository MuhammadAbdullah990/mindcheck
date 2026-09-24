import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../prisma/client.js';
import { AppError } from '../utils/errors.js';

export type AuthUser = {
  id: string;
  email: string;
  displayName: string | null;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
      /** Present when the caller supplied an anonymous token, logged in or not. */
      anonToken?: string;
    }
  }
}

type JwtPayload = {
  sub: string;
  email: string;
};

/**
 * Reads the anonymous token header and verifies a bearer token when present.
 * Never rejects: anonymous use is a first-class mode, so a bad or missing JWT
 * leaves `req.user` unset and routes that don't need auth carry on.
 */
export async function attachIdentity(req: Request, _res: Response, next: NextFunction) {
  const anonHeader = req.header('X-Anon-Token');
  if (anonHeader) {
    req.anonToken = anonHeader.trim();
  }

  const auth = req.header('Authorization');
  if (auth?.startsWith('Bearer ')) {
    const token = auth.slice('Bearer '.length).trim();
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

      // Re-read the user so a deleted account can't keep acting on a live token.
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, displayName: true },
      });
      if (user) {
        req.user = user;
      }
    } catch {
      // Invalid or expired token: stay anonymous rather than erroring here.
      // Protected routes reject with 401 via `requireAuth` below.
    }
  }

  next();
}

/** Gate for routes that genuinely need an account (e.g. results history). */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    next(AppError.unauthorized());
    return;
  }
  next();
}

export function signToken(user: { id: string; email: string }): string {
  const payload: JwtPayload = { sub: user.id, email: user.email };
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}
