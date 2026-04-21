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

// ── GET /insights — unified endpoint used by the insights dashboard ───────────
router.get('/insights', authenticate, async (req, res) => {
  const role = req.user.targetRole ?? 'Software Engineer';
  const location = req.user.location ?? 'United States';

  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return d.toLocaleString('default', { month: 'short' });
  });

  res.json({
    data: {
      salary: {
        role,
        location,
        min: 90000,
        median: 135000,
        max: 210000,
        currency: 'USD',
      },
      trends: months.map((month, i) => ({
        month,
        jobPostings: 4000 + i * 300 + Math.floor(Math.random() * 500),
        avgSalary: 128000 + i * 800,
        demandIndex: 65 + i * 2,
      })),
      topSkills: [
        { skill: 'TypeScript', demand: 88, growth: 12 },
        { skill: 'React', demand: 84, growth: 8 },
        { skill: 'Node.js', demand: 76, growth: 6 },
        { skill: 'AWS', demand: 72, growth: 15 },
        { skill: 'PostgreSQL', demand: 65, growth: 9 },
      ],
      topLocations: [
        { city: 'San Francisco, CA', count: 4200, avgSalary: 175000 },
        { city: 'New York, NY', count: 3800, avgSalary: 160000 },
        { city: 'Seattle, WA', count: 2900, avgSalary: 165000 },
        { city: 'Austin, TX', count: 2100, avgSalary: 140000 },
        { city: 'Remote', count: 8500, avgSalary: 145000 },
      ],
    },
  });
});

export { router as marketRouter };
