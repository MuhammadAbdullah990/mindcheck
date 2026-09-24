/**
 * Tests for the anonymous-screening flow, which is the path every first-time
 * user takes. Prisma is mocked so these run without a database; what is being
 * verified here is the controller's own logic — ownership checks, the
 * "every question answered" gate, and the crisis-flag thresholds.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppError } from '../utils/errors.js';

const prismaMock = {
  assessment: { findFirst: vi.fn() },
  session: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  response: { findMany: vi.fn(), upsert: vi.fn() },
  result: { findUnique: vi.fn(), create: vi.fn(), findMany: vi.fn(), update: vi.fn() },
  resource: { findMany: vi.fn() },
  $transaction: vi.fn(),
  $queryRaw: vi.fn(),
};

vi.mock('../prisma/client.js', () => ({ prisma: prismaMock }));
vi.mock('../services/resource.service.js', () => ({
  getResourcesForResult: vi.fn(async () => []),
}));

const { start, submitResponses, complete } = await import('./session.controller.js');


const PHQ9 = { id: 'a-phq9', slug: 'phq9', name: 'PHQ-9', isActive: true };

function makeReq(overrides: Record<string, unknown> = {}) {
  // `body`/`query` must be mutable: the Zod schemas in the controllers are
  // strict objects, and they strip unknown keys on their internal copy.
  return { body: {}, params: {}, query: {}, ...overrides } as never;
}

type TestRes = {
  statusCode: number;
  body: any;
  status(code: number): TestRes;
  json(payload: unknown): TestRes;
};

function makeRes(): TestRes {
  const res: TestRes = {
    statusCode: 200,
    body: null,
    status(code) {
      res.statusCode = code;
      return res;
    },
    json(payload) {
      res.body = payload;
      return res;
    },
  };
  return res;
}

/**
 * Calls a controller the way Express does and resolves with the error the
 * `asyncHandler` wrapper forwarded to `next` (or undefined on success).
 *
 * The controllers under test are wrapped, so they do not *throw* — they pass
 * the error to `next`. Calling them without a `next` would turn every expected
 * failure into an unhandled rejection instead of an assertion.
 */
async function call(handler: (req: never, res: never, next: any) => void, req: unknown) {
  const res = makeRes();
  let error: unknown;
  await handler(req as never, res as never, (err: unknown) => {
    error = err;
  });
  // `asyncHandler` hands the rejection to `next` in a microtask. Yield once so
  // it lands before we assert, rather than racing the handler's own awaits.
  await new Promise((r) => setTimeout(r, 0));
  return { res, error };
}

/** Asserts a handler forwarded the given HTTP status, and returns the error. */
function expectStatus(result: { error: unknown }, status: number) {
  expect(result.error).toBeInstanceOf(AppError);
  expect((result.error as AppError).statusCode).toBe(status);
}

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.resource.findMany.mockResolvedValue([]);
  prismaMock.$transaction.mockImplementation(async (arg: any) =>
    Array.isArray(arg) ? Promise.all(arg) : arg(prismaMock),
  );
});

describe('start', () => {
  it('rejects an anonymous start with no anon token', async () => {
    prismaMock.assessment.findFirst.mockResolvedValue(PHQ9);
    const { error } = await call(start, makeReq({ body: { assessmentSlug: 'phq9' } }));
    expectStatus({ error }, 400);
  });

  it('rejects an unknown assessment slug with 404', async () => {
    prismaMock.assessment.findFirst.mockResolvedValue(null);
    const { error } = await call(
      start,
      makeReq({ body: { assessmentSlug: 'nope', anonToken: crypto.randomUUID() } }),
    );
    expectStatus({ error }, 404);
  });

  it('stores the anon token so the session can be resumed', async () => {
    const anonToken = crypto.randomUUID();
    prismaMock.assessment.findFirst.mockResolvedValue(PHQ9);
    prismaMock.session.create.mockResolvedValue({
      id: 'sess-1',
      status: 'IN_PROGRESS',
      startedAt: new Date('2026-09-24T00:00:00Z'),
    });

    const { res, error } = await call(
      start,
      makeReq({ body: { assessmentSlug: 'phq9', anonToken } }),
    );
    expect(error).toBeUndefined();

    expect(prismaMock.session.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: null, anonToken, assessmentId: 'a-phq9' }),
      }),
    );
    expect(res.statusCode).toBe(201);
    expect(res.body.data.sessionId).toBe('sess-1');
  });
});

describe('submitResponses — ownership', () => {
  it("refuses another anonymous browser's session", async () => {
    prismaMock.session.findUnique.mockResolvedValue({
      id: 'sess-1',
      userId: null,
      anonToken: '00000000-0000-4000-8000-000000000000',
      status: 'IN_PROGRESS',
      assessment: PHQ9,
    });
    const { error } = await call(
      submitResponses,
      makeReq({
        params: { sessionId: 'sess-1' },
        body: { questionNum: 1, answerValue: 1, answerLabel: 'Several days' },
        anonToken: '11111111-1111-4111-8111-111111111111',
      }),
    );
    expectStatus({ error }, 403);
  });

  it('refuses to write to a completed session', async () => {
    prismaMock.session.findUnique.mockResolvedValue({
      id: 'sess-1',
      userId: null,
      anonToken: 'tok',
      status: 'COMPLETED',
      assessment: PHQ9,
    });
    const { error } = await call(
      submitResponses,
      makeReq({
        params: { sessionId: 'sess-1' },
        body: { questionNum: 1, answerValue: 1, answerLabel: 'Several days' },
        anonToken: 'tok',
      }),
    );
    expectStatus({ error }, 400);
  });
});

describe('submitResponses — validation', () => {
  beforeEach(() => {
    prismaMock.session.findUnique.mockResolvedValue({
      id: 'sess-1',
      userId: null,
      anonToken: 'tok',
      status: 'IN_PROGRESS',
      assessment: PHQ9,
    });
  });

  it('rejects a question number that does not exist', async () => {
    const { error } = await call(
      submitResponses,
      makeReq({
        params: { sessionId: 'sess-1' },
        body: { questionNum: 99, answerValue: 1, answerLabel: 'Several days' },
        anonToken: 'tok',
      }),
    );
    expectStatus({ error }, 400);
    expect(prismaMock.response.upsert).not.toHaveBeenCalled();
  });

  it('rejects an answer value outside the response scale', async () => {
    const { error } = await call(
      submitResponses,
      makeReq({
        params: { sessionId: 'sess-1' },
        // PHQ-9 tops out at 3.
        body: { questionNum: 1, answerValue: 4, answerLabel: 'Over a week' },
        anonToken: 'tok',
      }),
    );
    expectStatus({ error }, 400);
    expect(prismaMock.response.upsert).not.toHaveBeenCalled();
  });

  it('snapshots question text from the shared definition, not the client', async () => {
    prismaMock.response.upsert.mockResolvedValue({});
    const { error } = await call(
      submitResponses,
      makeReq({
        params: { sessionId: 'sess-1' },
        // A hostile client sends a bogus question text; it must be ignored.
        body: {
          questionNum: 1,
          answerValue: 1,
          answerLabel: 'Several days',
          questionText: 'HACKED',
        },
        anonToken: 'tok',
      }),
    );
    expect(error).toBeUndefined();

    const callArg = prismaMock.response.upsert.mock.calls[0][0];
    expect(callArg.create.questionText).toBe('Little interest or pleasure in doing things');
    expect(callArg.create.questionText).not.toBe('HACKED');
  });
});

describe('submitResponses — crisis flag thresholds', () => {
  beforeEach(() => {
    prismaMock.response.upsert.mockResolvedValue({});
  });

  async function submitCritical(slug: string, questionNum: number, answerValue: number) {
    prismaMock.session.findUnique.mockResolvedValue({
      id: 'sess-1',
      userId: null,
      anonToken: 'tok',
      status: 'IN_PROGRESS',
      assessment: { id: 'a', slug, name: slug, isActive: true },
    });
    const { res, error } = await call(
      submitResponses,
      makeReq({
        params: { sessionId: 'sess-1' },
        body: { questionNum, answerValue, answerLabel: 'answer' },
        anonToken: 'tok',
      }),
    );
    expect(error).toBeUndefined();
    return res.body.data.criticalAlert as boolean;
  }

  // PHQ-9 Q9 flags at >=1 ...
  it('flags PHQ-9 Q9 answered "several days" (1)', async () => {
    await expect(submitCritical('phq9', 9, 1)).resolves.toBe(true);
  });

  // ... while DASS-21's critical items only flag at >=2, matching the scoring
  // engine. A mismatch here would show a crisis banner the result never backs.
  it('does not flag DASS-21 item 10 answered "mildly" (1)', async () => {
    await expect(submitCritical('dass21', 10, 1)).resolves.toBe(false);
  });

  it('flags DASS-21 item 10 answered "moderately" (2)', async () => {
    await expect(submitCritical('dass21', 10, 2)).resolves.toBe(true);
  });

  it('does not flag a non-critical question at any value', async () => {
    await expect(submitCritical('phq9', 1, 3)).resolves.toBe(false);
  });
});

describe('complete', () => {
  function inProgressSession(assessmentSlug = 'phq9') {
    prismaMock.session.findUnique.mockResolvedValue({
      id: 'sess-1',
      userId: null,
      anonToken: 'tok',
      status: 'IN_PROGRESS',
      assessment: { id: 'a', slug: assessmentSlug, name: 'PHQ-9', isActive: true },
    });
  }

  it('refuses to score a partial questionnaire', async () => {
    inProgressSession();
    // Only 5 of PHQ-9's 9 questions answered.
    prismaMock.response.findMany.mockResolvedValue(
      Array.from({ length: 5 }, (_, i) => ({ questionNum: i + 1, answerValue: 1 })),
    );
    const { error } = await call(
      complete,
      makeReq({ params: { sessionId: 'sess-1' }, anonToken: 'tok' }),
    );
    expectStatus({ error }, 400);
    // The critical guarantee: a partial answer must never produce a severity.
    expect(prismaMock.result.create).not.toHaveBeenCalled();
  });

  it('refuses to complete an already-completed session', async () => {
    prismaMock.session.findUnique.mockResolvedValue({
      id: 'sess-1',
      userId: null,
      anonToken: 'tok',
      status: 'COMPLETED',
      assessment: { id: 'a', slug: 'phq9', name: 'PHQ-9', isActive: true },
    });
    const { error } = await call(
      complete,
      makeReq({ params: { sessionId: 'sess-1' }, anonToken: 'tok' }),
    );
    expectStatus({ error }, 409);
  });

  it('scores a complete PHQ-9 and marks the session completed', async () => {
    inProgressSession();
    // Nine answers of 1 → total 9 → "mild".
    prismaMock.response.findMany.mockResolvedValue(
      Array.from({ length: 9 }, (_, i) => ({ questionNum: i + 1, answerValue: 1 })),
    );
    prismaMock.result.create.mockResolvedValue({ id: 'res-1' });

    const { res, error } = await call(
      complete,
      makeReq({ params: { sessionId: 'sess-1' }, anonToken: 'tok' }),
    );
    expect(error).toBeUndefined();

    const created = prismaMock.result.create.mock.calls[0][0].data;
    expect(created.totalScore).toBe(9);
    expect(created.maxPossible).toBe(27);
    expect(created.severityLevel).toBe('mild');
    // Q9 answered 1 → the crisis flag must be persisted with the result.
    expect(created.criticalFlag).toBe(true);
    expect(created.flaggedItems).toEqual([9]);

    expect(prismaMock.session.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'COMPLETED' }),
      }),
    );
    expect(res.body.data.resultId).toBe('res-1');
  });

  it("refuses another anonymous browser's session", async () => {
    inProgressSession();
    const { error } = await call(
      complete,
      makeReq({
        params: { sessionId: 'sess-1' },
        anonToken: '99999999-9999-4999-8999-999999999999',
      }),
    );
    expectStatus({ error }, 403);
  });
});
