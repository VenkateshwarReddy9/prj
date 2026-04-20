import express, { type Express } from 'express';
import 'express-async-errors';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Routes
import { healthRouter } from './routes/health.js';
import { webhookRouter } from './routes/webhooks.js';
import { usersRouter } from './routes/users.js';
import { assessmentsRouter } from './routes/assessments.js';
import { chatRouter } from './routes/chat.js';
import { jobsRouter } from './routes/jobs.js';
import { resumesRouter } from './routes/resumes.js';
import { interviewsRouter } from './routes/interviews.js';
import { billingRouter } from './routes/billing.js';
import { notificationsRouter } from './routes/notifications.js';
import { roadmapRouter } from './routes/roadmap.js';
import { marketRouter } from './routes/market.js';
import { adminRouter } from './routes/admin.js';

export function createApp(): Express {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Compression
  app.use(compression());

  // Raw body capture for webhook signature verification (must come before json parser for webhook routes)
  app.use('/webhooks', (req, _res, next) => {
    let data = Buffer.alloc(0);
    req.on('data', (chunk: Buffer) => {
      data = Buffer.concat([data, chunk]);
    });
    req.on('end', () => {
      (req as typeof req & { rawBody: Buffer }).rawBody = data;
      next();
    });
  });

  // JSON body parser
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Routes — order matters (webhooks before auth-protected routes)
  app.use('/api/v1', healthRouter);
  app.use('/api/v1', webhookRouter);
  app.use('/api/v1', usersRouter);
  app.use('/api/v1', assessmentsRouter);
  app.use('/api/v1', chatRouter);
  app.use('/api/v1', jobsRouter);
  app.use('/api/v1', resumesRouter);
  app.use('/api/v1', interviewsRouter);
  app.use('/api/v1', billingRouter);
  app.use('/api/v1', notificationsRouter);
  app.use('/api/v1', roadmapRouter);
  app.use('/api/v1', marketRouter);
  app.use('/api/v1', adminRouter);

  // 404 and error handlers
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
