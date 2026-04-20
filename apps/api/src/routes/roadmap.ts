import { type Router, Router as ExpressRouter } from 'express';
import { authenticate } from '../middleware/auth.js';
import { prisma } from '../config/prisma.js';
import { NotFoundError, ForbiddenError } from '../lib/errors.js';

const router: Router = ExpressRouter();

router.get('/roadmap', authenticate, async (req, res) => {
  const roadmap = await prisma.skillRoadmap.findFirst({
    where: { userId: req.userId, isActive: true },
    include: {
      skills: { orderBy: { order: 'asc' } },
    },
  });
  res.json({ data: roadmap });
});

router.get('/roadmap/all', authenticate, async (req, res) => {
  const roadmaps = await prisma.skillRoadmap.findMany({
    where: { userId: req.userId },
    include: { skills: { orderBy: { order: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ data: roadmaps });
});

router.patch('/roadmap/skills/:id/complete', authenticate, async (req, res) => {
  const skill = await prisma.roadmapSkill.findUnique({
    where: { id: req.params['id'] },
    include: { roadmap: true },
  });
  if (!skill) throw new NotFoundError('Skill');
  if (skill.roadmap.userId !== req.userId) throw new ForbiddenError();

  const updated = await prisma.roadmapSkill.update({
    where: { id: req.params['id'] },
    data: { completedAt: skill.completedAt ? null : new Date() },
  });

  res.json({ data: updated });
});

router.get('/roadmap/skills', authenticate, async (req, res) => {
  const skills = await prisma.userSkill.findMany({
    where: { userId: req.userId },
    orderBy: { skillName: 'asc' },
  });
  res.json({ data: skills });
});

router.put('/roadmap/skills', authenticate, async (req, res) => {
  const { skillName, level } = req.body as { skillName: string; level: number };

  const skill = await prisma.userSkill.upsert({
    where: { userId_skillName: { userId: req.userId, skillName } },
    update: { level, updatedAt: new Date() },
    create: { userId: req.userId, skillName, level },
  });

  res.json({ data: skill });
});

export { router as roadmapRouter };
