import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.js';
import * as auth from '../controllers/auth.controller.js';
import * as assessments from '../controllers/assessment.controller.js';
import * as sessions from '../controllers/session.controller.js';
import * as results from '../controllers/result.controller.js';
import * as resources from '../controllers/resource.controller.js';
import { prisma } from '../prisma/client.js';

const router = Router();

// Rate limits from 05_API_SPECIFICATION.md. Keyed by IP; the auth limits are
// deliberately tight to blunt credential stuffing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Too many attempts. Please try again in 15 minutes.' },
  },
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Too many accounts created. Please try again later.' },
  },
});

const sessionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Too many screening sessions started. Please try again later.' },
  },
});

// ─── Health ───────────────────────────────────────────────────────────────
// Unauthenticated so Render's health check can reach it.
router.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ success: true, data: { status: 'ok', database: 'up' } });
  } catch {
    res.status(503).json({ success: false, error: { code: 'SERVICE_UNAVAILABLE', message: 'Database unreachable' } });
  }
});

// ─── Auth ─────────────────────────────────────────────────────────────────
router.post('/auth/register', registerLimiter, auth.register);
router.post('/auth/login', authLimiter, auth.login);
router.get('/auth/me', requireAuth, auth.me);

// ─── Assessments ──────────────────────────────────────────────────────────
router.get('/assessments', assessments.list);
router.get('/assessments/:slug', assessments.detail);

// ─── Sessions ─────────────────────────────────────────────────────────────
router.post('/sessions', sessionLimiter, sessions.start);
router.get('/sessions/:sessionId', sessions.getSession);
router.post('/sessions/:sessionId/responses', sessions.submitResponses);
router.post('/sessions/:sessionId/complete', sessions.complete);
router.post('/sessions/:sessionId/difficulty', sessions.setDifficulty);

// ─── Results ──────────────────────────────────────────────────────────────
// Note: `/history` is declared before `/:resultId` so "history" is never
// captured as a result id.
router.get('/results/history', requireAuth, results.history);
router.get('/results/:resultId', results.detail);

// ─── Resources ────────────────────────────────────────────────────────────
router.get('/resources', resources.list);

export default router;
