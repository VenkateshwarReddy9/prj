import type { Server as HTTPServer } from 'http';
import { Server } from 'socket.io';
import { createClerkClient } from '@clerk/clerk-sdk-node';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from '@careercompass/types';

let ioInstance: Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> | null = null;

const clerk = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });

export function createSocketServer(
  httpServer: HTTPServer
): Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> {
  const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
    httpServer,
    {
      cors: {
        origin: env.FRONTEND_URL,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    }
  );

  // Auth middleware — verify Clerk token on connect
  io.use(async (socket, next) => {
    const token = socket.handshake.auth['token'] as string | undefined;
    if (!token) {
      next(new Error('Authentication required'));
      return;
    }

    try {
      const verifiedToken = await clerk.verifyToken(token);
      const clerkId = verifiedToken.sub;
      const user = await prisma.user.findUnique({ where: { clerkId } });
      if (!user) {
        next(new Error('User not found'));
        return;
      }
      socket.data.userId = user.id;
      socket.data.clerkId = clerkId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    logger.debug({ userId, socketId: socket.id }, 'Socket connected');

    // Automatically join personal room
    socket.join(`user:${userId}`);

    socket.on('subscribe:assessment', (jobId: string) => {
      socket.join(`assessment:${jobId}`);
      logger.debug({ jobId, userId }, 'Subscribed to assessment updates');
    });

    socket.on('subscribe:chat', (sessionId: string) => {
      socket.join(`chat:${sessionId}`);
    });

    socket.on('unsubscribe', (room: string) => {
      socket.leave(room);
    });

    socket.on('disconnect', () => {
      logger.debug({ userId, socketId: socket.id }, 'Socket disconnected');
    });
  });

  ioInstance = io;
  return io;
}

export function getIO() {
  if (!ioInstance) {
    throw new Error('Socket.IO not initialized. Call createSocketServer first.');
  }
  return ioInstance;
}
