export class AppError extends Error {
  constructor(
    public override message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class PlanRequiredError extends AppError {
  constructor(public requiredPlan: 'STARTER' | 'PRO' | 'ENTERPRISE') {
    super(`This feature requires the ${requiredPlan} plan`, 403, 'PLAN_REQUIRED');
  }
}

export class QuotaExceededError extends AppError {
  constructor(
    public resource: string,
    public limit: number,
    public current: number
  ) {
    super(`${resource} quota exceeded (${current}/${limit})`, 429, 'QUOTA_EXCEEDED');
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class RateLimitError extends AppError {
  constructor(public retryAfter: number) {
    super('Too many requests', 429, 'RATE_LIMITED');
  }
}
