import type { Request, Response, NextFunction } from 'express';
import { createClerkClient } from '@clerk/clerk-sdk-node';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { UnauthorizedError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';

const clerk = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing authorization token');
    }

    const token = authHeader.slice(7);

    let clerkUserId: string;
    try {
      const verifiedToken = await clerk.verifyToken(token);
      clerkUserId = verifiedToken.sub;
    } catch {
      throw new UnauthorizedError('Invalid or expired token');
    }

    let user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });

    // Lazy user creation for cases where webhook hasn't fired yet
    if (!user) {
      try {
        const clerkUser = await clerk.users.getUser(clerkUserId);
        const email = clerkUser.emailAddresses[0]?.emailAddress ?? '';
        user = await prisma.user.upsert({
          where: { clerkId: clerkUserId },
          update: {},
          create: {
            clerkId: clerkUserId,
            email,
            name: `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || null,
            avatarUrl: clerkUser.imageUrl ?? null,
          },
        });
      } catch (err) {
        logger.error({ err, clerkUserId }, 'Failed to lazy-create user');
        throw new UnauthorizedError('User not found');
      }
    }

    req.userId = user.id;
    req.clerkId = clerkUserId;
    req.user = user;

    next();
  } catch (err) {
    next(err);
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const adminIds = env.ADMIN_USER_IDS.split(',').map((id) => id.trim()).filter(Boolean);
  if (!adminIds.includes(req.user.clerkId)) {
    next(new UnauthorizedError('Admin access required'));
    return;
  }
  next();
}
