import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { requirePlan, requireAssessmentQuota } from '../requirePlan.js';
import { prisma } from '../../config/prisma.js';

function makeReq(plan: string): Partial<Request> {
  return {
    user: { id: 'user_1', plan: plan as never, clerkId: 'clerk_1', email: 'a@b.com' } as never,
  };
}

const mockRes = {} as Response;

describe('requirePlan', () => {
  it('calls next() when user meets minimum plan', () => {
    const next = vi.fn() as NextFunction;
    requirePlan('STARTER')(makeReq('STARTER') as Request, mockRes, next);
    expect(next).toHaveBeenCalledWith(); // no error arg
  });

  it('calls next() when user exceeds minimum plan', () => {
    const next = vi.fn() as NextFunction;
    requirePlan('STARTER')(makeReq('PRO') as Request, mockRes, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('passes PlanRequiredError when user plan is too low', () => {
    const next = vi.fn() as NextFunction;
    requirePlan('PRO')(makeReq('FREE') as Request, mockRes, next);
    const err = (next as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(err).toBeDefined();
    expect(err.message).toMatch(/PRO/i);
  });

  it('passes PlanRequiredError when FREE tries ENTERPRISE feature', () => {
    const next = vi.fn() as NextFunction;
    requirePlan('ENTERPRISE')(makeReq('FREE') as Request, mockRes, next);
    const err = (next as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(err).toBeDefined();
  });
});

describe('requireAssessmentQuota', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls next() when under quota', async () => {
    (prisma.assessment.count as ReturnType<typeof vi.fn>).mockResolvedValue(0);
    const next = vi.fn() as NextFunction;
    await requireAssessmentQuota()(makeReq('FREE') as Request, mockRes, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('passes QuotaExceededError when at limit', async () => {
    (prisma.assessment.count as ReturnType<typeof vi.fn>).mockResolvedValue(1);
    const next = vi.fn() as NextFunction;
    await requireAssessmentQuota()(makeReq('FREE') as Request, mockRes, next);
    const err = (next as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(err).toBeDefined();
    expect(err.message).toMatch(/quota/i);
  });

  it('skips quota check for PRO (unlimited)', async () => {
    const next = vi.fn() as NextFunction;
    await requireAssessmentQuota()(makeReq('PRO') as Request, mockRes, next);
    expect(prisma.assessment.count).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith();
  });
});
