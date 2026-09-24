import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';
import { attachIdentity } from './middleware/auth.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { env, isProd } from './config/env.js';

export function createApp() {
  const app = express();

  // Trust the first proxy hop so req.ip (used by rate limiting) is the real
  // client address rather than the proxy's, when deployed behind Render/Vercel.
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '256kb' }));
  app.use(express.urlencoded({ extended: false, limit: '256kb' }));

  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  }));

  app.use(attachIdentity);

  app.get('/', (_req, res) => {
    res.json({
      success: true,
      data: {
        name: 'MindCheck API',
        version: '1.0.0',
        docs: 'See 05_API_SPECIFICATION.md',
        disclaimer:
          'MindCheck is a screening tool, not a medical device. It does not diagnose conditions.',
      },
    });
  });

  app.use('/api', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
