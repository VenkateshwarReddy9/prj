import { type Router, Router as ExpressRouter } from 'express';
import { prisma } from '../config/prisma.js';
import { redis } from '../config/redis.js';

const router: Router = ExpressRouter();

router.get('/health', async (_req, res) => {
  const checks: Record<string, boolean> = {
    api: true,
    database: false,
    redis: false,
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks['database'] = true;
  } catch {
    // db unhealthy
  }

  try {
    await redis.ping();
    checks['redis'] = true;
  } catch {
    // redis unhealthy
  }

  const allHealthy = Object.values(checks).every(Boolean);
  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks,
  });
});

export { router as healthRouter };
