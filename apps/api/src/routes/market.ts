import { type Router, Router as ExpressRouter } from 'express';
import { authenticate } from '../middleware/auth.js';
import { redis } from '../config/redis.js';
import { CACHE_KEYS, CACHE_TTL } from '@careercompass/constants';

const router: Router = ExpressRouter();

// Salary data endpoint — in production, integrate Levels.fyi API or BLS data
router.get('/market/salary', authenticate, async (req, res) => {
  const role = (req.query['role'] as string) ?? req.user.targetRole ?? 'Software Engineer';
  const location = (req.query['location'] as string) ?? req.user.location ?? 'United States';

  const cacheKey = CACHE_KEYS.insightsSalary(role, location);
  const cached = await redis.get(cacheKey).catch(() => null);
  if (cached) {
    res.json(JSON.parse(cached));
    return;
  }

  // Mock data — replace with real API integration
  const salaryData = {
    role,
    location,
    p10: 85000,
    p25: 105000,
    median: 130000,
    p75: 165000,
    p90: 210000,
    currency: 'USD',
    source: 'CareerCompass Insights',
    updatedAt: new Date().toISOString(),
  };

  const response = { data: salaryData };
  await redis.setex(cacheKey, CACHE_TTL.insightsSalary, JSON.stringify(response)).catch(() => null);
  res.json(response);
});

// Hiring trends — in production, integrate job posting API data
router.get('/market/trends', authenticate, async (req, res) => {
  const role = (req.query['role'] as string) ?? req.user.targetRole ?? 'Software Engineer';

  const cacheKey = CACHE_KEYS.marketTrends(role);
  const cached = await redis.get(cacheKey).catch(() => null);
  if (cached) {
    res.json(JSON.parse(cached));
    return;
  }

  // Mock trend data — replace with real job posting trend data
  const now = new Date();
  const trends = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    return {
      period: month.toISOString().slice(0, 7),
      jobPostings: Math.floor(5000 + Math.random() * 3000),
      growthRate: (Math.random() * 0.2 - 0.05),
    };
  });

  const response = {
    data: {
      role,
      trends,
      demandScore: 78,
      competitionLevel: 'medium' as const,
      topSkillsDemanded: ['TypeScript', 'React', 'Node.js', 'AWS', 'PostgreSQL'],
      topCompaniesHiring: ['Google', 'Meta', 'Stripe', 'Linear', 'Vercel'],
      topLocations: [
        { city: 'San Francisco', country: 'US', jobCount: 4200 },
        { city: 'New York', country: 'US', jobCount: 3800 },
        { city: 'Seattle', country: 'US', jobCount: 2900 },
        { city: 'Austin', country: 'US', jobCount: 2100 },
        { city: 'Remote', country: 'Global', jobCount: 8500 },
      ],
    },
  };

  await redis.setex(cacheKey, CACHE_TTL.marketTrends, JSON.stringify(response)).catch(() => null);
  res.json(response);
});

export { router as marketRouter };
