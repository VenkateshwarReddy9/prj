export const CACHE_KEYS = {
  userProfile: (userId: string) => `user:${userId}:profile`,
  userAssessmentLatest: (userId: string) => `user:${userId}:assessment:latest`,
  jobSearch: (hash: string) => `jobs:search:${hash}`,
  insightsSalary: (role: string, location: string) => `insights:salary:${role}:${location}`,
  marketTrends: (role: string) => `market:trends:${role}`,
  userPlan: (userId: string) => `user:${userId}:plan`,
  rateLimitTokens: (userId: string, endpoint: string) =>
    `ratelimit:${userId}:${endpoint}`,
} as const;

export const CACHE_TTL = {
  userProfile: 60 * 10,         // 10 minutes
  userAssessment: 60 * 30,      // 30 minutes
  jobSearch: 60 * 5,            // 5 minutes
  insightsSalary: 60 * 60 * 24, // 24 hours
  marketTrends: 60 * 60 * 6,    // 6 hours
  userPlan: 60 * 5,             // 5 minutes
} as const;
