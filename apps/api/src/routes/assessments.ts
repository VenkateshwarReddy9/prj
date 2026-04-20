import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireAssessmentQuota } from '../middleware/requirePlan.js';
import { validateBody } from '../middleware/validate.js';
import { prisma } from '../config/prisma.js';
import { assessmentQueue } from '../queues/index.js';
import { NotFoundError, ForbiddenError } from '../lib/errors.js';
import { SubmitAssessmentSchema, SaveAssessmentAnswersSchema } from '@careercompass/validators';

const router = Router();

// Start a new assessment (creates a draft)
router.post('/assessments', authenticate, requireAssessmentQuota(), async (req, res) => {
  const assessment = await prisma.assessment.create({
    data: {
      userId: req.userId,
      answers: [],
      status: 'PENDING',
    },
  });
  res.status(201).json({ data: assessment });
});

// Save partial answers (resumable)
router.patch(
  '/assessments/:id/answers',
  authenticate,
  validateBody(SaveAssessmentAnswersSchema),
  async (req, res) => {
    const assessment = await prisma.assessment.findUnique({ where: { id: req.params['id'] } });
    if (!assessment) throw new NotFoundError('Assessment');
    if (assessment.userId !== req.userId) throw new ForbiddenError();

    const updated = await prisma.assessment.update({
      where: { id: req.params['id'] },
      data: { answers: req.body.answers },
    });
    res.json({ data: updated });
  }
);

// Submit final answers → queue AI processing
router.post(
  '/assessments/:id/submit',
  authenticate,
  validateBody(SubmitAssessmentSchema),
  async (req, res) => {
    const assessment = await prisma.assessment.findUnique({ where: { id: req.params['id'] } });
    if (!assessment) throw new NotFoundError('Assessment');
    if (assessment.userId !== req.userId) throw new ForbiddenError();

    const updated = await prisma.assessment.update({
      where: { id: req.params['id'] },
      data: { answers: req.body.answers, status: 'PENDING' },
    });

    const job = await assessmentQueue.add('generate-results', {
      assessmentId: updated.id,
      userId: req.userId,
      answers: req.body.answers,
    });

    await prisma.assessment.update({
      where: { id: updated.id },
      data: { jobId: job.id ?? null },
    });

    res.json({ data: { assessmentId: updated.id, jobId: job.id } });
  }
);

// Get assessment by ID
router.get('/assessments/:id', authenticate, async (req, res) => {
  const assessment = await prisma.assessment.findUnique({
    where: { id: req.params['id'] },
    include: { jobRecommendations: { orderBy: { matchScore: 'desc' } } },
  });
  if (!assessment) throw new NotFoundError('Assessment');
  if (assessment.userId !== req.userId) throw new ForbiddenError();
  res.json({ data: assessment });
});

// List user assessments
router.get('/assessments', authenticate, async (req, res) => {
  const assessments = await prisma.assessment.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      jobId: true,
      createdAt: true,
      updatedAt: true,
      tokensUsed: true,
      processingMs: true,
    },
  });
  res.json({ data: assessments });
});

export { router as assessmentsRouter };
