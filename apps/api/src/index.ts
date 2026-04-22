import 'dotenv/config';
import * as Sentry from '@sentry/node';
import http from 'http';
import { createApp } from './app.js';
import { createSocketServer } from './socket/index.js';
import { createAssessmentWorker } from './queues/assessment.worker.js';
import { createResumeParseWorker } from './queues/resume-parse.worker.js';
import { createEmailWorker } from './queues/email.worker.js';
import { createEmbeddingWorker } from './queues/embedding.worker.js';
import { setSocketIO } from './services/notification/notification.service.js';
import { prisma } from './config/prisma.js';
import { redis } from './config/redis.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';

async function main() {
  if (env.SENTRY_DSN) {
    Sentry.init({
      dsn: env.SENTRY_DSN,
      environment: env.NODE_ENV,
      tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
    });
  }

  const app = createApp();
  const httpServer = http.createServer(app);

  // Socket.IO
  const io = createSocketServer(httpServer);
  setSocketIO(io);

  // BullMQ Workers
  const assessmentWorker = createAssessmentWorker();
  const resumeParseWorker = createResumeParseWorker();
  const emailWorker = createEmailWorker();
  const embeddingWorker = createEmbeddingWorker();

  assessmentWorker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'Assessment job failed');
  });

  resumeParseWorker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'Resume parse job failed');
  });

  // Start server
  const port = env.PORT;
  httpServer.listen(port, () => {
    logger.info({ port, env: env.NODE_ENV }, 'CareerCompass API started');
  });

  // Graceful shutdown
  async function shutdown(signal: string) {
    logger.info({ signal }, 'Shutting down gracefully...');

    httpServer.close(async () => {
      logger.info('HTTP server closed');

      // Drain BullMQ workers
      await Promise.all([
        assessmentWorker.close(),
        resumeParseWorker.close(),
        emailWorker.close(),
        embeddingWorker.close(),
      ]);
      logger.info('BullMQ workers closed');

      // Close DB connections
      await prisma.$disconnect();
      logger.info('Database disconnected');

      await redis.quit();
      logger.info('Redis disconnected');

      process.exit(0);
    });

    // Force shutdown after 30s
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30_000);
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});
