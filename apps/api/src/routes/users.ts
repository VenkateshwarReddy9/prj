import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { prisma } from '../config/prisma.js';
import { redis } from '../config/redis.js';
import { CACHE_KEYS, CACHE_TTL } from '@careercompass/constants';
import { OnboardingSchema, UpdateProfileSchema } from '@careercompass/validators';

const router = Router();

router.get('/users/me', authenticate, async (req, res) => {
  const cacheKey = CACHE_KEYS.userProfile(req.userId);
  const cached = await redis.get(cacheKey).catch(() => null);
  if (cached) {
    res.json({ data: JSON.parse(cached) });
    return;
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: req.userId },
    select: {
      id: true,
      clerkId: true,
      email: true,
      name: true,
      avatarUrl: true,
      plan: true,
      onboardingDone: true,
      currentTitle: true,
      targetRole: true,
      yearsExp: true,
      skills: true,
      location: true,
      createdAt: true,
      _count: {
        select: {
          assessments: true,
          savedJobs: true,
          resumes: true,
        },
      },
    },
  });

  await redis.setex(cacheKey, CACHE_TTL.userProfile, JSON.stringify(user)).catch(() => null);
  res.json({ data: user });
});

router.post('/users/onboarding', authenticate, validateBody(OnboardingSchema), async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.userId },
    data: {
      ...req.body,
      onboardingDone: true,
    },
  });
  await redis.del(CACHE_KEYS.userProfile(req.userId)).catch(() => null);
  res.json({ data: user });
});

router.patch('/users/me', authenticate, validateBody(UpdateProfileSchema), async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.userId },
    data: req.body,
  });
  await redis.del(CACHE_KEYS.userProfile(req.userId)).catch(() => null);
  res.json({ data: user });
});

router.get('/users/me/usage', authenticate, async (req, res) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [assessments, chatMessages, resumes, interviewSessions, savedJobs, tokenAgg] =
    await Promise.all([
      prisma.assessment.count({
        where: { userId: req.userId, createdAt: { gte: startOfMonth } },
      }),
      prisma.chatMessage.count({
        where: {
          role: 'USER',
          session: { userId: req.userId },
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.resume.count({ where: { userId: req.userId } }),
      prisma.interviewSession.count({
        where: { userId: req.userId, createdAt: { gte: startOfMonth } },
      }),
      prisma.savedJob.count({ where: { userId: req.userId } }),
      prisma.tokenUsage.aggregate({
        where: { userId: req.userId, createdAt: { gte: startOfMonth } },
        _sum: { inputTokens: true, outputTokens: true, costUsd: true },
      }),
    ]);

  res.json({
    data: {
      assessmentsThisMonth: assessments,
      chatMessagesThisMonth: chatMessages,
      resumeUploads: resumes,
      interviewSessionsThisMonth: interviewSessions,
      savedJobs,
      aiTokensUsed:
        (tokenAgg._sum.inputTokens ?? 0) + (tokenAgg._sum.outputTokens ?? 0),
      aiCostUsd: tokenAgg._sum.costUsd ?? 0,
    },
  });
});

export { router as usersRouter };
