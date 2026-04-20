import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireChatQuota } from '../middleware/requirePlan.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { validateBody } from '../middleware/validate.js';
import { prisma } from '../config/prisma.js';
import { streamChatResponse } from '../services/ai/chat.ai.js';
import { NotFoundError, ForbiddenError } from '../lib/errors.js';
import { CreateChatSessionSchema, SendMessageSchema } from '@careercompass/validators';
import type { AssessmentResult } from '@careercompass/types';

const router = Router();

router.post('/chat/sessions', authenticate, validateBody(CreateChatSessionSchema), async (req, res) => {
  const session = await prisma.chatSession.create({
    data: {
      userId: req.userId,
      title: req.body.title ?? 'Career Chat',
    },
  });
  res.status(201).json({ data: session });
});

router.get('/chat/sessions', authenticate, async (req, res) => {
  const sessions = await prisma.chatSession.findMany({
    where: { userId: req.userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });
  res.json({ data: sessions });
});

router.get('/chat/sessions/:id', authenticate, async (req, res) => {
  const session = await prisma.chatSession.findUnique({
    where: { id: req.params['id'] },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  });
  if (!session) throw new NotFoundError('Chat session');
  if (session.userId !== req.userId) throw new ForbiddenError();
  res.json({ data: session });
});

// Stream chat — SSE endpoint
router.post(
  '/chat/sessions/:id/messages',
  authenticate,
  requireChatQuota(),
  rateLimiter('chat'),
  validateBody(SendMessageSchema),
  async (req, res) => {
    const session = await prisma.chatSession.findUnique({
      where: { id: req.params['id'] },
      include: { messages: { orderBy: { createdAt: 'asc' }, take: 30 } },
    });
    if (!session) throw new NotFoundError('Chat session');
    if (session.userId !== req.userId) throw new ForbiddenError();

    // Save user message first
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: 'USER',
        content: req.body.content,
      },
    });

    // Fetch user's latest assessment result for context
    const latestAssessment = await prisma.assessment.findFirst({
      where: { userId: req.userId, status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' },
      select: { result: true },
    });

    const latestResult = latestAssessment?.result as AssessmentResult | null;

    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    let fullContent = '';
    let tokensUsed = 0;

    try {
      for await (const event of streamChatResponse(
        req.user,
        session.messages,
        req.body.content,
        latestResult
      )) {
        if (event.type === 'token') {
          fullContent += event.content;
          res.write(`data: ${JSON.stringify({ type: 'token', content: event.content })}\n\n`);
        } else if (event.type === 'done') {
          tokensUsed = event.usage.inputTokens + event.usage.outputTokens;
          res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
        } else if (event.type === 'error') {
          res.write(`data: ${JSON.stringify({ type: 'error', message: event.message })}\n\n`);
        }
      }
    } catch {
      res.write(`data: ${JSON.stringify({ type: 'error', message: 'Stream failed' })}\n\n`);
    }

    // Save AI response to DB
    if (fullContent) {
      await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          role: 'ASSISTANT',
          content: fullContent,
          tokensUsed,
        },
      });

      await prisma.chatSession.update({
        where: { id: session.id },
        data: { tokensUsed: { increment: tokensUsed }, updatedAt: new Date() },
      });
    }

    res.end();
  }
);

router.delete('/chat/sessions/:id', authenticate, async (req, res) => {
  const session = await prisma.chatSession.findUnique({ where: { id: req.params['id'] } });
  if (!session) throw new NotFoundError('Chat session');
  if (session.userId !== req.userId) throw new ForbiddenError();
  await prisma.chatSession.delete({ where: { id: req.params['id'] } });
  res.json({ data: { deleted: true } });
});

export { router as chatRouter };
