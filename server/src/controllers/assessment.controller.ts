import type { Request, Response } from 'express';
import { prisma } from '../prisma/client.js';
import { AppError } from '../utils/errors.js';
import { asyncHandler } from '../middleware/error.js';
import { getAssessment } from '@shared/questionnaires';

/** Summary shape for the list endpoint (no questions — keeps the payload small). */
export const list = asyncHandler(async (_req: Request, res: Response) => {
  const rows = await prisma.assessment.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      slug: true,
      name: true,
      fullName: true,
      description: true,
      timeframe: true,
      estimatedTime: true,
      totalItems: true,
      maxScore: true,
      subscales: true,
    },
  });

  res.json({ success: true, data: rows });
});

/**
 * Full detail for one assessment, including questions and response options.
 * Question text comes from the shared definitions (not the DB) so what the
 * user reads and what the scoring engine scores can never diverge.
 */
export const detail = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params as { slug: string };

  const row = await prisma.assessment.findUnique({ where: { slug } });
  if (!row || !row.isActive) {
    throw AppError.notFound(`No assessment found with slug "${slug}"`);
  }

  const definition = getAssessment(slug);
  if (!definition) {
    // Assessment exists in the DB but has no definition — a seeding mismatch.
    throw AppError.internal(`Assessment "${slug}" has no questionnaire definition`);
  }

  res.json({
    success: true,
    data: {
      id: row.id,
      slug: row.slug,
      name: row.name,
      fullName: row.fullName,
      description: row.description,
      instructions: row.instructions,
      timeframe: row.timeframe,
      estimatedTime: row.estimatedTime,
      totalItems: row.totalItems,
      maxScore: row.maxScore,
      subscales: row.subscales,
      hasFunctionalImpairmentQuestion: definition.hasFunctionalImpairmentQuestion,
      questions: definition.questions,
      responseOptions: definition.responseOptions,
    },
  });
});
