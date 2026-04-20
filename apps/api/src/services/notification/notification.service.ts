import { prisma } from '../../config/prisma.js';
import { logger } from '../../lib/logger.js';
import type { NotifType } from '@prisma/client';

interface CreateNotificationParams {
  userId: string;
  type: NotifType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

// io will be injected to avoid circular imports
let ioRef: { to(room: string): { emit(event: string, data: unknown): void } } | null = null;

export function setSocketIO(
  io: { to(room: string): { emit(event: string, data: unknown): void } }
) {
  ioRef = io;
}

export async function createNotification(params: CreateNotificationParams) {
  const notification = await prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      data: params.data ?? {},
    },
  });

  // Push real-time notification via Socket.IO
  if (ioRef) {
    ioRef.to(`user:${params.userId}`).emit('notification:new', notification);
  }

  logger.info({ notificationId: notification.id, userId: params.userId, type: params.type }, 'Notification created');

  return notification;
}
