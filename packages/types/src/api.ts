export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    cursor?: string;
  };
}

export interface PlanRequiredError extends ApiError {
  error: 'PLAN_REQUIRED';
  requiredPlan: 'STARTER' | 'PRO' | 'ENTERPRISE';
}

export interface QuotaExceededError extends ApiError {
  error: 'QUOTA_EXCEEDED';
  resource: string;
  limit: number;
  current: number;
  resetAt?: string;
}
