import { type Router, Router as ExpressRouter } from 'express';
import { authenticate } from '../middleware/auth.js';
import { prisma } from '../config/prisma.js';
import { NotFoundError, ForbiddenError } from '../lib/errors.js';

const router: Router = ExpressRouter();

router.get('/notifications', authenticate, async (req, res) => {
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.notification.count({
      where: { userId: req.userId, read: false },
    }),
  ]);
  res.json({ data: { notifications, unreadCount } });
});

router.patch('/notifications/:id/read', authenticate, async (req, res) => {
  const notification = await prisma.notification.findUnique({
    where: { id: req.params['id'] },
  });
  if (!notification) throw new NotFoundError('Notification');
  if (notification.userId !== req.userId) throw new ForbiddenError();

  const updated = await prisma.notification.update({
    where: { id: req.params['id'] },
    data: { read: true },
  });
  res.json({ data: updated });
});

router.patch('/notifications/read-all', authenticate, async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.userId, read: false },
    data: { read: true },
  });
  res.json({ data: { updated: true } });
});

export { router as notificationsRouter };
