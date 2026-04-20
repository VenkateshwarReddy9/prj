import type { Request, Response, NextFunction } from 'express';
import type { Plan } from '@prisma/client';
import { PlanRequiredError, QuotaExceededError } from '../lib/errors.js';
import { PLAN_ORDER, PLAN_LIMITS } from '@careercompass/constants';
import type { PlanTier } from '@careercompass/constants';
import { prisma } from '../config/prisma.js';

function planRank(plan: Plan): number {
  return PLAN_ORDER.indexOf(plan as PlanTier);
}

export function requirePlan(minPlan: 'STARTER' | 'PRO' | 'ENTERPRISE') {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (planRank(req.user.plan) < planRank(minPlan as Plan)) {
      next(new PlanRequiredError(minPlan));
      return;
    }
    next();
  };
}

export function requireAssessmentQuota() {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const plan = req.user.plan as PlanTier;
      const limit = PLAN_LIMITS[plan].assessmentsPerMonth;
      if (limit === -1) {
        next();
        return;
      }

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const count = await prisma.assessment.count({
        where: {
          userId: req.user.id,
          createdAt: { gte: startOfMonth },
          status: { in: ['COMPLETED', 'PROCESSING', 'PENDING'] },
        },
      });

      if (count >= limit) {
        next(new QuotaExceededError('assessments', limit, count));
        return;
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function requireChatQuota() {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const plan = req.user.plan as PlanTier;
      const limit = PLAN_LIMITS[plan].chatMessagesPerMonth;
      if (limit === -1) {
        next();
        return;
      }

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const count = await prisma.chatMessage.count({
        where: {
          role: 'USER',
          session: {
            userId: req.user.id,
          },
          createdAt: { gte: startOfMonth },
        },
      });

      if (count >= limit) {
        next(new QuotaExceededError('chat_messages', limit, count));
        return;
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
