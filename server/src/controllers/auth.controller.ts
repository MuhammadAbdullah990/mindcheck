import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma/client.js';
import { AppError } from '../utils/errors.js';
import { signToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(200),
  displayName: z.string().min(1).max(80).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

const publicUser = (u: { id: string; email: string; displayName: string | null }) => ({
  id: u.id,
  email: u.email,
  displayName: u.displayName,
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, displayName } = registerSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw AppError.conflict('An account with that email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, passwordHash, displayName: displayName ?? null },
    select: { id: true, email: true, displayName: true },
  });

  res.status(201).json({
    success: true,
    data: { user: publicUser(user), token: signToken(user) },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email } });
  // Compare a dummy hash when the user is missing so the response time does
  // not reveal whether an email is registered.
  const hash = user?.passwordHash ?? '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidiu';
  const ok = await bcrypt.compare(password, hash);

  if (!user || !ok) {
    throw AppError.unauthorized('Incorrect email or password');
  }

  res.json({
    success: true,
    data: {
      user: publicUser(user),
      token: signToken({ id: user.id, email: user.email }),
    },
  });
});

/** `requireAuth` runs on the route, so `req.user` is guaranteed here. */
export const me = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: req.user });
});
