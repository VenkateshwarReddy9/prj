import type { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis.js';
import { AI_RATE_LIMITS } from '@careercompass/constants';
import type { PlanTier } from '@careercompass/constants';
import { RateLimitError } from '../lib/errors.js';

/**
 * Redis token bucket rate limiter.
 * key: ratelimit:{userId}:{endpoint}
 */
export function rateLimiter(endpoint: string) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const plan = (req.user?.plan as PlanTier) ?? 'FREE';
      const limits = AI_RATE_LIMITS[plan];
      const key = `ratelimit:${req.userId}:${endpoint}`;
      const windowSec = 60;
      const maxRequests = limits.rpm;

      const now = Math.floor(Date.now() / 1000);
      const windowStart = now - windowSec;

      const pipeline = redis.pipeline();
      pipeline.zremrangebyscore(key, 0, windowStart);
      pipeline.zadd(key, now, `${now}-${Math.random()}`);
      pipeline.zcard(key);
      pipeline.expire(key, windowSec * 2);

      const results = await pipeline.exec();
      const count = (results?.[2]?.[1] as number) ?? 0;

      if (count > maxRequests) {
        next(new RateLimitError(windowSec));
        return;
      }
      next();
    } catch {
      // Don't block request if Redis is unavailable
      next();
    }
  };
}
