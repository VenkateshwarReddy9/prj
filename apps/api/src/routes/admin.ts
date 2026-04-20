import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { prisma } from '../config/prisma.js';

const router = Router();

router.get('/admin/metrics', authenticate, requireAdmin, async (_req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOf30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsersThisMonth,
    assessmentsThisMonth,
    completedAssessments,
    tokenCostThisMonth,
    planBreakdown,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.assessment.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.assessment.count({ where: { status: 'COMPLETED' } }),
    prisma.tokenUsage.aggregate({
      where: { createdAt: { gte: startOf30Days } },
      _sum: { costUsd: true, inputTokens: true, outputTokens: true },
    }),
    prisma.user.groupBy({
      by: ['plan'],
      _count: true,
    }),
  ]);

  res.json({
    data: {
      totalUsers,
      newUsersThisMonth,
      assessmentsThisMonth,
      completedAssessments,
      aiCostLast30Days: tokenCostThisMonth._sum.costUsd ?? 0,
      aiTokensLast30Days:
        (tokenCostThisMonth._sum.inputTokens ?? 0) + (tokenCostThisMonth._sum.outputTokens ?? 0),
      planBreakdown: planBreakdown.reduce(
        (acc, p) => ({ ...acc, [p.plan]: p._count }),
        {} as Record<string, number>
      ),
    },
  });
});

router.get('/admin/users', authenticate, requireAdmin, async (req, res) => {
  const page = Number(req.query['page'] ?? 1);
  const limit = Number(req.query['limit'] ?? 50);
  const search = req.query['search'] as string | undefined;

  const where = search
    ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' as const } },
          { name: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        onboardingDone: true,
        createdAt: true,
        _count: { select: { assessments: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

router.patch('/admin/users/:id/plan', authenticate, requireAdmin, async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.params['id'] },
    data: { plan: req.body.plan },
  });
  res.json({ data: user });
});

export { router as adminRouter };
