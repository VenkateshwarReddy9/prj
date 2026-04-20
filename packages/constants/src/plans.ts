export const PLAN_ORDER = ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'] as const;
export type PlanTier = (typeof PLAN_ORDER)[number];

export const PLAN_LIMITS: Record<
  PlanTier,
  {
    assessmentsPerMonth: number;
    savedJobs: number;
    chatMessagesPerMonth: number;
    resumeUploads: number;
    interviewSessionsPerMonth: number;
    jobMatchesPerAssessment: number;
  }
> = {
  FREE: {
    assessmentsPerMonth: 1,
    savedJobs: 10,
    chatMessagesPerMonth: 20,
    resumeUploads: 1,
    interviewSessionsPerMonth: 2,
    jobMatchesPerAssessment: 5,
  },
  STARTER: {
    assessmentsPerMonth: 3,
    savedJobs: 50,
    chatMessagesPerMonth: 100,
    resumeUploads: 3,
    interviewSessionsPerMonth: 10,
    jobMatchesPerAssessment: 20,
  },
  PRO: {
    assessmentsPerMonth: -1,
    savedJobs: -1,
    chatMessagesPerMonth: -1,
    resumeUploads: 10,
    interviewSessionsPerMonth: -1,
    jobMatchesPerAssessment: -1,
  },
  ENTERPRISE: {
    assessmentsPerMonth: -1,
    savedJobs: -1,
    chatMessagesPerMonth: -1,
    resumeUploads: -1,
    interviewSessionsPerMonth: -1,
    jobMatchesPerAssessment: -1,
  },
};

export const AI_RATE_LIMITS: Record<PlanTier, { rpm: number; tpd: number }> = {
  FREE: { rpm: 2, tpd: 50_000 },
  STARTER: { rpm: 10, tpd: 200_000 },
  PRO: { rpm: 30, tpd: 1_000_000 },
  ENTERPRISE: { rpm: 100, tpd: Infinity },
};

export const PLAN_PRICES = {
  STARTER: {
    monthly: process.env['STRIPE_STARTER_MONTHLY_PRICE_ID'] ?? 'price_starter_monthly',
    annual: process.env['STRIPE_STARTER_ANNUAL_PRICE_ID'] ?? 'price_starter_annual',
    monthlyAmount: 1900,
    annualAmount: 15900,
  },
  PRO: {
    monthly: process.env['STRIPE_PRO_MONTHLY_PRICE_ID'] ?? 'price_pro_monthly',
    annual: process.env['STRIPE_PRO_ANNUAL_PRICE_ID'] ?? 'price_pro_annual',
    monthlyAmount: 4900,
    annualAmount: 39900,
  },
} as const;

export const PLAN_FEATURES: Record<PlanTier, string[]> = {
  FREE: [
    '1 career assessment/month',
    '5 job matches per assessment',
    '20 AI chat messages total',
    '1 resume upload',
    '2 interview sessions/month',
    'Basic market insights',
  ],
  STARTER: [
    '3 career assessments/month',
    '20 job matches per assessment',
    '100 AI chat messages/month',
    '3 resume uploads',
    '10 interview sessions/month',
    'Full market insights',
  ],
  PRO: [
    'Unlimited assessments',
    'Unlimited job matches',
    'Unlimited AI chat',
    '10 resume uploads',
    'Unlimited interview sessions',
    'Full market insights + exports',
    'Priority AI processing',
  ],
  ENTERPRISE: [
    'Everything in Pro',
    'Unlimited resume uploads',
    'Team management',
    'Custom AI tuning',
    'Dedicated support',
    'SSO / SAML',
    'SLA guarantee',
  ],
};
