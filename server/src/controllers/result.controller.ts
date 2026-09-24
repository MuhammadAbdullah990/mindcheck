import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma/client.js';
import { AppError } from '../utils/errors.js';
import { asyncHandler } from '../middleware/error.js';
import { calculateScore, type ResponseItem } from '@shared/scoring';
import { getResourcesForResult } from '../services/resource.service.js';

const historySchema = z.object({
  assessment: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * A result is readable by the session's owner (account or anon token). Results
 * are sensitive health information, so this check is mandatory.
 */
async function requireOwnedResult(resultId: string, req: Request) {
  const result = await prisma.result.findUnique({
    where: { id: resultId },
    include: { session: { include: { assessment: true } } },
  });
  if (!result) throw AppError.notFound('Result not found');

  const { session } = result;
  if (req.user) {
    if (session.userId !== req.user.id) throw AppError.forbidden();
  } else if (session.anonToken !== req.anonToken) {
    throw AppError.forbidden();
  }

  return result;
}

export const detail = asyncHandler(async (req: Request, res: Response) => {
  const { resultId } = req.params as { resultId: string };
  const result = await requireOwnedResult(resultId, req);

  const responses = await prisma.response.findMany({
    where: { sessionId: result.sessionId },
    orderBy: { questionNum: 'asc' },
    select: { questionNum: true, answerValue: true },
  });

  // Interpretation and recommendations are derived, not stored — recomputing
  // keeps wording changes from leaving stale text in old results.
  const scored = calculateScore(
    result.session.assessment.slug,
    responses.map((r): ResponseItem => ({ questionNum: r.questionNum, answerValue: r.answerValue })),
  );

  const resources = await getResourcesForResult(
    result.severityLevel,
    categoryFor(result.session.assessment.slug),
  );

  res.json({
    success: true,
    data: {
      id: result.id,
      assessment: {
        name: result.session.assessment.name,
        slug: result.session.assessment.slug,
        fullName: result.session.assessment.fullName,
      },
      totalScore: result.totalScore,
      maxPossible: result.maxPossible,
      percentage: Math.round((result.totalScore / result.maxPossible) * 1000) / 10,
      severityLevel: result.severityLevel,
      severityColor: result.severityColor,
      criticalFlag: result.criticalFlag,
      flaggedItems: result.flaggedItems,
      subscaleScores: scored.subscaleScores,
      difficultyLevel: result.difficultyLevel,
      completedAt: result.session.completedAt,
      createdAt: result.createdAt,
      interpretation: scored.interpretation,
      recommendations: scored.recommendations,
      responses,
      resources,
    },
  });
});

/** Past results for the logged-in user, newest first. */
export const history = asyncHandler(async (req: Request, res: Response) => {
  const { assessment, limit } = historySchema.parse(req.query);

  const rows = await prisma.result.findMany({
    where: {
      session: {
        userId: req.user!.id,
        ...(assessment ? { assessment: { slug: assessment } } : {}),
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      totalScore: true,
      maxPossible: true,
      severityLevel: true,
      severityColor: true,
      criticalFlag: true,
      createdAt: true,
      session: { select: { assessment: { select: { name: true, slug: true } } } },
    },
  });

  res.json({
    success: true,
    data: rows.map((r) => ({
      id: r.id,
      assessment: r.session.assessment.name,
      assessmentSlug: r.session.assessment.slug,
      totalScore: r.totalScore,
      maxPossible: r.maxPossible,
      severityLevel: r.severityLevel,
      severityColor: r.severityColor,
      criticalFlag: r.criticalFlag,
      completedAt: r.createdAt,
    })),
  });
});

function categoryFor(slug: string): string {
  switch (slug) {
    case 'phq9':
      return 'depression';
    case 'gad7':
      return 'anxiety';
    case 'pss10':
      return 'stress';
    default:
      return 'general';
  }
}
