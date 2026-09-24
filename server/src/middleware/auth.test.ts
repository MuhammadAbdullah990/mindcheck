/**
 * Tests for the identity middleware. The important behaviours are:
 *   - anonymous access is never blocked
 *   - a *deleted* account cannot keep acting on a still-valid token
 *   - a bad token degrades to anonymous rather than erroring
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errors.js';

const prismaMock = {
  user: { findUnique: vi.fn() },
  session: {},
  response: {},
  result: {},
  resource: {},
  assessment: {},
  $transaction: vi.fn(),
  $queryRaw: vi.fn(),
};

vi.mock('../prisma/client.js', () => ({ prisma: prismaMock }));

const { attachIdentity, requireAuth, signToken } = await import('./auth.js');
const { env } = await import('../config/env.js');


type TestReq = {
  headers: Record<string, string>;
  user?: { id: string; email: string; displayName: string | null };
  anonToken?: string;
};

function makeReq(headers: Record<string, string> = {}): TestReq {
  return {
    headers,
    header(name: string) {
      return this.headers[name];
    },
  } as TestReq;
}

function makeRes() {
  return {} as never;
}

/** Runs a middleware and captures whatever it passed to `next`. */
async function run(
  middleware: (req: never, res: never, next: any) => void | Promise<void>,
  req: unknown,
) {
  let nextArg: unknown;
  let called = false;
  await middleware(req as never, makeRes(), (arg?: unknown) => {
    called = true;
    nextArg = arg;
  });
  await new Promise((r) => setTimeout(r, 0));
  return { called, nextArg };
}

const USER = { id: 'user-1', email: 'a@b.com', displayName: 'A' };

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.user.findUnique.mockResolvedValue(USER);
});

describe('attachIdentity', () => {
  it('attaches the anonymous token when present', async () => {
    const req = makeReq({ 'X-Anon-Token': '  anon-123  ' });
    const { called, nextArg } = await run(attachIdentity, req);

    expect(called).toBe(true);
    expect(nextArg).toBeUndefined();
    expect(req.anonToken).toBe('anon-123');
  });

  it('passes an anonymous request through with no user', async () => {
    const req = makeReq();
    await run(attachIdentity, req);
    expect(req.user).toBeUndefined();
  });

  it('resolves a valid bearer token to a user', async () => {
    const token = jwt.sign({ sub: USER.id, email: USER.email }, env.JWT_SECRET, {
      expiresIn: '7d',
    });
    const req = makeReq({ Authorization: `Bearer ${token}` });
    await run(attachIdentity, req);

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: USER.id },
      select: { id: true, email: true, displayName: true },
    });
    expect(req.user).toEqual(USER);
  });

  it('leaves a token for a deleted account unauthenticated', async () => {
    // The JWT is still cryptographically valid; the account is gone.
    prismaMock.user.findUnique.mockResolvedValue(null);
    const token = jwt.sign({ sub: 'deleted-user', email: 'gone@b.com' }, env.JWT_SECRET, {
      expiresIn: '7d',
    });
    const req = makeReq({ Authorization: `Bearer ${token}` });
    const { nextArg } = await run(attachIdentity, req);

    expect(req.user).toBeUndefined();
    // Degrades to anonymous rather than erroring — the route decides.
    expect(nextArg).toBeUndefined();
  });

  it('ignores a token signed with the wrong secret', async () => {
    const token = jwt.sign({ sub: USER.id, email: USER.email }, 'wrong-secret-wrong-secret-wrong', {
      expiresIn: '7d',
    });
    const req = makeReq({ Authorization: `Bearer ${token}` });
    const { nextArg } = await run(attachIdentity, req);

    expect(req.user).toBeUndefined();
    expect(nextArg).toBeUndefined();
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it('ignores an expired token', async () => {
    const token = jwt.sign({ sub: USER.id, email: USER.email }, env.JWT_SECRET, {
      expiresIn: '-1s',
    });
    const req = makeReq({ Authorization: `Bearer ${token}` });
    await run(attachIdentity, req);
    expect(req.user).toBeUndefined();
  });
});

describe('requireAuth', () => {
  it('rejects an anonymous request with 401', async () => {
    const { nextArg } = await run(requireAuth, makeReq());
    expect(nextArg).toBeInstanceOf(AppError);
    expect((nextArg as AppError).statusCode).toBe(401);
  });

  it('lets an authenticated request through', async () => {
    const req = { ...makeReq(), user: USER };
    const { called, nextArg } = await run(requireAuth, req);
    expect(called).toBe(true);
    expect(nextArg).toBeUndefined();
  });
});

describe('signToken', () => {
  it('round-trips the user id through a verifiable token', () => {
    const token = signToken({ id: USER.id, email: USER.email });
    const payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
    expect(payload.sub).toBe(USER.id);
  });
});
