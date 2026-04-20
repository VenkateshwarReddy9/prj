import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, PlanRequiredError, QuotaExceededError, RateLimitError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  // Log the error
  if (!(err instanceof AppError) || err.statusCode >= 500) {
    logger.error(
      {
        err,
        path: req.path,
        method: req.method,
        userId: req.userId,
      },
      'Unhandled error'
    );
  }

  if (err instanceof PlanRequiredError) {
    res.status(403).json({
      error: 'PLAN_REQUIRED',
      message: err.message,
      requiredPlan: err.requiredPlan,
    });
    return;
  }

  if (err instanceof QuotaExceededError) {
    res.status(429).json({
      error: 'QUOTA_EXCEEDED',
      message: err.message,
      resource: err.resource,
      limit: err.limit,
      current: err.current,
    });
    return;
  }

  if (err instanceof RateLimitError) {
    res.setHeader('Retry-After', err.retryAfter);
    res.status(429).json({
      error: 'RATE_LIMITED',
      message: err.message,
      retryAfter: err.retryAfter,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: err.flatten().fieldErrors,
    });
    return;
  }

  // Catch-all for unhandled errors
  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message:
      process.env['NODE_ENV'] === 'production'
        ? 'An internal error occurred'
        : err.message,
  });
}

export function notFound(req: Request, res: Response) {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`,
  });
}
