import type { PlanTier } from '@careercompass/constants';

declare global {
  namespace Express {
    interface Request {
      userId: string;
      clerkId: string;
      user: {
        id: string;
        clerkId: string;
        email: string;
        name: string | null;
        currentTitle: string | null;
        targetRole: string | null;
        yearsExp: number | null;
        location: string | null;
        skills: string[];
        plan: PlanTier;
        stripeCustomerId: string | null;
        createdAt: Date;
        updatedAt: Date;
      };
    }
  }
}

export {};
