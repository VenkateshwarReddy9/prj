import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { prisma } from '../config/prisma.js';
import { generateInterviewQuestions, evaluateInterviewAnswer } from '../services/ai/interview.ai.js';
import { NotFoundError, ForbiddenError } from '../lib/errors.js';
import { StartInterviewSchema, SubmitAnswerSchema } from '@careercompass/validators';
import type { InterviewQuestion, InterviewAnswer } from '@careercompass/types';

const router = Router();

router.post(
  '/interviews/sessions',
  authenticate,
  validateBody(StartInterviewSchema),
  async (req, res) => {
    const { type, targetRole, company } = req.body;

    const questions = await generateInterviewQuestions(type, targetRole, req.userId, company);

    const session = await prisma.interviewSession.create({
      data: {
        userId: req.userId,
        type,
        targetRole,
        questions: questions as object[],
        answers: [],
      },
    });

    res.status(201).json({ data: session });
  }
);

router.get('/interviews/sessions', authenticate, async (req, res) => {
  const sessions = await prisma.interviewSession.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      type: true,
      targetRole: true,
      overallScore: true,
      completedAt: true,
      createdAt: true,
    },
  });
  res.json({ data: sessions });
});

router.get('/interviews/sessions/:id', authenticate, async (req, res) => {
  const session = await prisma.interviewSession.findUnique({
    where: { id: req.params['id'] },
  });
  if (!session) throw new NotFoundError('Interview session');
  if (session.userId !== req.userId) throw new ForbiddenError();
  res.json({ data: session });
});

router.post(
  '/interviews/sessions/:id/answers',
  authenticate,
  validateBody(SubmitAnswerSchema),
  async (req, res) => {
    const session = await prisma.interviewSession.findUnique({
      where: { id: req.params['id'] },
    });
    if (!session) throw new NotFoundError('Interview session');
    if (session.userId !== req.userId) throw new ForbiddenError();

    const questions = session.questions as InterviewQuestion[];
    const question = questions.find((q) => q.id === req.body.questionId);
    if (!question) throw new NotFoundError('Question');

    const evaluation = await evaluateInterviewAnswer(
      question.question,
      req.body.answer,
      session.targetRole,
      req.userId
    );

    const existingAnswers = session.answers as InterviewAnswer[];
    const newAnswer: InterviewAnswer = {
      questionId: req.body.questionId,
      answer: req.body.answer,
      score: evaluation.score,
      feedback: evaluation.feedback,
      improvedExample: evaluation.improvedExample,
      evaluatedAt: new Date().toISOString(),
    };

    const updatedAnswers = [
      ...existingAnswers.filter((a) => a.questionId !== req.body.questionId),
      newAnswer,
    ];

    // Calculate overall score if all questions answered
    const allAnswered = updatedAnswers.length === questions.length;
    const overallScore = allAnswered
      ? Math.round(updatedAnswers.reduce((sum, a) => sum + (a.score ?? 0), 0) / updatedAnswers.length)
      : null;

    const updated = await prisma.interviewSession.update({
      where: { id: req.params['id'] },
      data: {
        answers: updatedAnswers as object[],
        overallScore: overallScore ?? undefined,
        completedAt: allAnswered ? new Date() : undefined,
      },
    });

    res.json({ data: { answer: newAnswer, session: updated } });
  }
);

export { router as interviewsRouter };
