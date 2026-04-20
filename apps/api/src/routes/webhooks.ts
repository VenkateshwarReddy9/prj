import { Router, type Request, type Response } from 'express';
import { Webhook } from 'svix';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { handleWebhookEvent } from '../services/billing/stripe.service.js';
import { sendWelcomeEmail } from '../services/notification/email.service.js';
import { logger } from '../lib/logger.js';

const router = Router();

// Clerk webhook — sync user to DB
router.post('/webhooks/clerk', async (req: Request, res: Response) => {
  const svixId = req.headers['svix-id'] as string;
  const svixTimestamp = req.headers['svix-timestamp'] as string;
  const svixSignature = req.headers['svix-signature'] as string;

  if (!svixId || !svixTimestamp || !svixSignature) {
    res.status(400).json({ error: 'Missing Svix headers' });
    return;
  }

  const wh = new Webhook(env.CLERK_WEBHOOK_SECRET);
  let event: { type: string; data: Record<string, unknown> };

  try {
    const payload = (req as Request & { rawBody: Buffer }).rawBody?.toString() ?? JSON.stringify(req.body);
    event = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as typeof event;
  } catch (err) {
    logger.warn({ err }, 'Clerk webhook signature verification failed');
    res.status(400).json({ error: 'Invalid webhook signature' });
    return;
  }

  try {
    const { type, data } = event;
    logger.info({ type }, 'Processing Clerk webhook');

    if (type === 'user.created') {
      const email = (data['email_addresses'] as Array<{ email_address: string }>)?.[0]?.email_address ?? '';
      const firstName = (data['first_name'] as string) ?? '';
      const lastName = (data['last_name'] as string) ?? '';
      const clerkId = data['id'] as string;

      const user = await prisma.user.upsert({
        where: { clerkId },
        update: {},
        create: {
          clerkId,
          email,
          name: `${firstName} ${lastName}`.trim() || null,
          avatarUrl: (data['image_url'] as string) ?? null,
        },
      });

      await sendWelcomeEmail(user.email, user.name ?? 'there');
      logger.info({ userId: user.id, clerkId }, 'User created from Clerk webhook');
    }

    if (type === 'user.updated') {
      const clerkId = data['id'] as string;
      const email = (data['email_addresses'] as Array<{ email_address: string }>)?.[0]?.email_address ?? '';
      const firstName = (data['first_name'] as string) ?? '';
      const lastName = (data['last_name'] as string) ?? '';

      await prisma.user.updateMany({
        where: { clerkId },
        data: {
          email,
          name: `${firstName} ${lastName}`.trim() || null,
          avatarUrl: (data['image_url'] as string) ?? null,
        },
      });
    }

    if (type === 'user.deleted') {
      const clerkId = data['id'] as string;
      await prisma.user.updateMany({
        where: { clerkId },
        data: { email: `deleted-${clerkId}@careercompass.deleted` },
      });
    }

    res.status(200).json({ received: true });
  } catch (err) {
    logger.error({ err }, 'Clerk webhook processing error');
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Stripe webhook — raw body required for signature verification
router.post(
  '/webhooks/stripe',
  async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string;
    if (!signature) {
      res.status(400).json({ error: 'Missing Stripe signature' });
      return;
    }

    try {
      const rawBody = (req as Request & { rawBody: Buffer }).rawBody;
      await handleWebhookEvent(rawBody, signature);
      res.status(200).json({ received: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error({ err }, 'Stripe webhook error');
      res.status(400).json({ error: message });
    }
  }
);

export { router as webhookRouter };
