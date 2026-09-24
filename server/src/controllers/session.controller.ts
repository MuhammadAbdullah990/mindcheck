import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma/client.js';
import { AppError } from '../utils/errors.js';
import { asyncHandler } from '../middleware/error.js';
import { getAssessment } from '@shared/questionnaires';
import { calculateScore, type ResponseItem } from '@shared/scoring';
import { getResourcesForResult } from '../services/resource.service.js';

const startSchema = z.object({
  assessmentSlug: z.string().min(1),
  anonToken: z.string().uuid().optional(),
});

const responseSchema = z.object({
  questionNum: z.number().int().positive(),
  answerValue: z.number().int().min(0).max(4),
  answerLabel: z.string().min(1).max(200),
});

const submitSchema = z.union([
  responseSchema,
  z.object({ responses: z.array(responseSchema).min(1).max(64) }),
]);

const difficultySchema = z.object({
  difficultyLevel: z.enum(['not difficult', 'somewhat', 'very', 'extremely']),
});

function extractResponses(body: unknown): z.infer<typeof responseSchema>[] {
  const parsed = submitSchema.parse(body);
  return 'responses' in parsed ? parsed.responses : [parsed];
}

/**
 * A session belongs to a requester when it matches their account, or — for
 * anonymous users — their anon token. The anon token is a bearer secret, so
 * the comparison must be exact.
 */
async function requireOwnedSession(sessionId: string, req: Request) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { assessment: true },
  });
  if (!session) throw AppError.notFound('Session not found');

  if (req.user) {
    if (session.userId !== req.user.id) throw AppError.forbidden();
    return session;
  }

  if (session.anonToken && session.anonToken === req.anonToken) {
    return session;
  }

  throw AppError.forbidden();
}

export const start = asyncHandler(async (req: Request, res: Response) => {
  const { assessmentSlug, anonToken } = startSchema.parse(req.body);

  const assessment = await prisma.assessment.findFirst({
    where: { slug: assessmentSlug, isActive: true },
  });
  if (!assessment) {
    throw AppError.notFound(`No assessment found with slug "${assessmentSlug}"`);
  }

  if (!req.user && !anonToken && !req.anonToken) {
    throw AppError.badRequest(
      'An anonToken is required when starting a session without an account',
      [{ field: 'anonToken', message: 'Required for anonymous sessions' }],
    );
  }

  const session = await prisma.session.create({
    data: {
      userId: req.user?.id ?? null,
      anonToken: req.user ? null : (anonToken ?? req.anonToken),
      assessmentId: assessment.id,
    },
  });

  res.status(201).json({
    success: true,
    data: {
      sessionId: session.id,
      assessmentSlug: assessment.slug,
      status: session.status,
      startedAt: session.startedAt,
    },
  });
});

/**
 * Saves one or more answers. Re-answering the same question is treated as an
 * update, not a conflict, so a user who changes their mind mid-questionnaire
 * isn't blocked.
 */
export const submitResponses = asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params as { sessionId: string };
  const session = await requireOwnedSession(sessionId, req);

  if (session.status !== 'IN_PROGRESS') {
    throw AppError.badRequest('This session has already been completed');
  }

  const definition = getAssessment(session.assessment.slug);
  if (!definition) {
    throw AppError.internal(`Assessment "${session.assessment.slug}" has no questionnaire definition`);
  }

  const submitted = extractResponses(req.body);

  for (const r of submitted) {
    const question = definition.questions.find((q) => q.number === r.questionNum);
    if (!question) {
      throw AppError.badRequest(
        `Question ${r.questionNum} does not exist on ${session.assessment.slug}`,
        [{ field: 'questionNum', message: `Must be between 1 and ${definition.totalItems}` }],
      );
    }

    const maxValue = definition.responseOptions.length - 1;
    if (r.answerValue > maxValue) {
      throw AppError.badRequest(
        `Answer for question ${r.questionNum} is out of range`,
        [{ field: 'answerValue', message: `Must be between 0 and ${maxValue}` }],
      );
    }
  }

  // Upsert so a changed answer overwrites the previous one. questionText is
  // snapshotted from the shared definition, never trusted from the client.
  await prisma.$transaction(
    submitted.map((r) => {
      const question = definition.questions.find((q) => q.number === r.questionNum)!;
      return prisma.response.upsert({
        where: { sessionId_questionNum: { sessionId, questionNum: r.questionNum } },
        create: {
          sessionId,
          questionNum: r.questionNum,
          questionText: question.text,
          answerValue: r.answerValue,
          answerLabel: r.answerLabel,
        },
        update: { answerValue: r.answerValue, answerLabel: r.answerLabel },
      });
    }),
  );

  // A crisis answer should surface on the results screen, not just at
  // completion — report it as soon as it is recorded.
  //
  // The threshold is instrument-specific: PHQ-9 Q9 flags at >= 1 (any
  // non-zero endorsement counts), while DASS-21 items 10/17/21 flag at >= 2.
  // These match the scoring engine exactly — a lower threshold here than in
  // `calculateScore` would show a crisis banner the final result never backs up.
  const CRITICAL_THRESHOLD: Record<string, number> = { phq9: 1, dass21: 2 };
  const threshold = CRITICAL_THRESHOLD[session.assessment.slug] ?? 1;
  const criticalAlert = submitted.some(
    (r) =>
      r.answerValue >= threshold &&
      definition.questions.some((q) => q.number === r.questionNum && q.isCritical),
  );

  res.json({
    success: true,
    data: { saved: submitted.length, criticalAlert },
  });
});

/**
 * Scores a completed session. Requires every question to be answered —
 * a partial questionnaire would silently produce a misclassified severity,
 * which for this app is the worst kind of bug.
 */
export const complete = asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params as { sessionId: string };
  const session = await requireOwnedSession(sessionId, req);

  if (session.status === 'COMPLETED') {
    throw AppError.conflict('This session has already been completed');
  }

  const definition = getAssessment(session.assessment.slug);
  if (!definition) {
    throw AppError.internal(`Assessment "${session.assessment.slug}" has no questionnaire definition`);
  }

  const responses = await prisma.response.findMany({
    where: { sessionId },
    orderBy: { questionNum: 'asc' },
  });

  if (responses.length !== definition.totalItems) {
    throw AppError.badRequest(
      `All ${definition.totalItems} questions must be answered before completing (received ${responses.length})`,
    );
  }

  const items: ResponseItem[] = responses.map((r) => ({
    questionNum: r.questionNum,
    answerValue: r.answerValue,
  }));

  const scored = calculateScore(session.assessment.slug, items);

  const result = await prisma.$transaction(async (tx) => {
    const created = await tx.result.create({
      data: {
        sessionId,
        totalScore: scored.totalScore,
        maxPossible: scored.maxPossible,
        severityLevel: scored.severityLevel,
        severityColor: scored.severityColor,
        // Prisma's Json column wants a plain serialisable value.
        subscaleScores: scored.subscaleScores ? (scored.subscaleScores as object) : undefined,
        criticalFlag: scored.criticalFlag,
        flaggedItems: scored.flaggedItems,
      },
    });

    await tx.session.update({
      where: { id: sessionId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });

    return created;
  });

  const resources = await getResourcesForResult(scored.severityLevel, categoryFor(session.assessment.slug));

  res.json({
    success: true,
    data: {
      resultId: result.id,
      assessmentSlug: session.assessment.slug,
      assessmentName: session.assessment.name,
      totalScore: scored.totalScore,
      maxPossible: scored.maxPossible,
      severityLevel: scored.severityLevel,
      severityColor: scored.severityColor,
      criticalFlag: scored.criticalFlag,
      flaggedItems: scored.flaggedItems,
      subscaleScores: scored.subscaleScores,
      interpretation: scored.interpretation,
      recommendations: scored.recommendations,
      resources,
    },
  });
});

/** Optional PHQ-9/GAD-7 follow-up about functional impact. */
export const setDifficulty = asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params as { sessionId: string };
  const { difficultyLevel } = difficultySchema.parse(req.body);
  await requireOwnedSession(sessionId, req);

  const result = await prisma.result.findUnique({ where: { sessionId } });
  if (!result) throw AppError.notFound('Result not found for this session');

  const updated = await prisma.result.update({
    where: { id: result.id },
    data: { difficultyLevel },
    select: { id: true, difficultyLevel: true },
  });

  res.json({ success: true, data: updated });
});

/** Resume support: returns the session plus any answers already saved. */
export const getSession = asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params as { sessionId: string };
  const session = await requireOwnedSession(sessionId, req);

  const responses = await prisma.response.findMany({
    where: { sessionId },
    orderBy: { questionNum: 'asc' },
    select: { questionNum: true, answerValue: true, answerLabel: true },
  });

  res.json({
    success: true,
    data: {
      sessionId: session.id,
      assessmentSlug: session.assessment.slug,
      status: session.status,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      responses,
    },
  });
});

/** Maps an instrument to the resource category most relevant to it. */
function categoryFor(slug: string): string {
  switch (slug) {
    case 'phq9':
      return 'depression';
    case 'gad7':
      return 'anxiety';
    case 'pss10':
      return 'stress';
    case 'dass21':
      // DASS spans all three; pass the worst subscale's domain through.
      return 'general';
    default:
      return 'general';
  }
}
