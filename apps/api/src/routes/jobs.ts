import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { prisma } from '../config/prisma.js';
import { redis } from '../config/redis.js';
import { NotFoundError, ForbiddenError } from '../lib/errors.js';
import { SaveJobSchema, UpdateJobStatusSchema, JobSearchSchema } from '@careercompass/validators';
import { CACHE_KEYS, CACHE_TTL } from '@careercompass/constants';
import crypto from 'crypto';
import type { JobSearchInput } from '@careercompass/validators';

const router = Router();

async function fetchExternalJobs(filters: JobSearchInput) {
  const results: Array<{
    externalId: string;
    source: string;
    title: string;
    company: string;
    location: string;
    url: string;
    description: string;
    salaryMin: number | null;
    salaryMax: number | null;
    remote: boolean;
    postedAt: string;
  }> = [];

  // Adzuna integration
  if (process.env['ADZUNA_APP_ID'] && process.env['ADZUNA_API_KEY']) {
    try {
      const params = new URLSearchParams({
        app_id: process.env['ADZUNA_APP_ID'],
        app_key: process.env['ADZUNA_API_KEY'],
        results_per_page: String(filters.limit ?? 20),
        what: filters.query ?? '',
        where: filters.location ?? '',
        content_type: 'application/json',
      });
      const url = `https://api.adzuna.com/v1/api/jobs/us/search/1?${params}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json() as { results?: Array<{id: string; title: string; company: {display_name: string}; location: {display_name: string}; redirect_url: string; description: string; salary_min?: number; salary_max?: number; created: string}> };
        for (const job of data.results ?? []) {
          results.push({
            externalId: job.id,
            source: 'adzuna',
            title: job.title,
            company: job.company?.display_name ?? 'Unknown',
            location: job.location?.display_name ?? '',
            url: job.redirect_url,
            description: job.description,
            salaryMin: job.salary_min ?? null,
            salaryMax: job.salary_max ?? null,
            remote: (job.title + job.description).toLowerCase().includes('remote'),
            postedAt: job.created,
          });
        }
      }
    } catch {
      // External API unavailable — continue with cached/empty results
    }
  }

  return results;
}

router.get('/jobs/search', authenticate, validateQuery(JobSearchSchema), async (req, res) => {
  const filters = req.query as unknown as JobSearchInput;
  const cacheHash = crypto
    .createHash('md5')
    .update(JSON.stringify(filters))
    .digest('hex');
  const cacheKey = CACHE_KEYS.jobSearch(cacheHash);

  const cached = await redis.get(cacheKey).catch(() => null);
  if (cached) {
    res.json(JSON.parse(cached));
    return;
  }

  const jobs = await fetchExternalJobs(filters);

  const response = { data: jobs, total: jobs.length };
  await redis.setex(cacheKey, CACHE_TTL.jobSearch, JSON.stringify(response)).catch(() => null);
  res.json(response);
});

router.post('/jobs/save', authenticate, validateBody(SaveJobSchema), async (req, res) => {
  const savedJob = await prisma.savedJob.upsert({
    where: {
      userId_externalId_source: {
        userId: req.userId,
        externalId: req.body.externalId,
        source: req.body.source,
      },
    },
    update: {},
    create: {
      userId: req.userId,
      ...req.body,
    },
  });
  res.status(201).json({ data: savedJob });
});

router.get('/jobs/saved', authenticate, async (req, res) => {
  const savedJobs = await prisma.savedJob.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ data: savedJobs });
});

router.patch(
  '/jobs/:id/status',
  authenticate,
  validateBody(UpdateJobStatusSchema),
  async (req, res) => {
    const job = await prisma.savedJob.findUnique({ where: { id: req.params['id'] } });
    if (!job) throw new NotFoundError('Saved job');
    if (job.userId !== req.userId) throw new ForbiddenError();

    const updated = await prisma.savedJob.update({
      where: { id: req.params['id'] },
      data: {
        status: req.body.status,
        notes: req.body.notes ?? job.notes,
        appliedAt: req.body.status === 'APPLIED' ? (req.body.appliedAt ? new Date(req.body.appliedAt) : new Date()) : job.appliedAt,
      },
    });
    res.json({ data: updated });
  }
);

router.delete('/jobs/:id', authenticate, async (req, res) => {
  const job = await prisma.savedJob.findUnique({ where: { id: req.params['id'] } });
  if (!job) throw new NotFoundError('Saved job');
  if (job.userId !== req.userId) throw new ForbiddenError();
  await prisma.savedJob.delete({ where: { id: req.params['id'] } });
  res.json({ data: { deleted: true } });
});

export { router as jobsRouter };
