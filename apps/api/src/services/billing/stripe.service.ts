import Stripe from 'stripe';
import { env } from '../../config/env.js';
import { prisma } from '../../config/prisma.js';
import { logger } from '../../lib/logger.js';
import type { Plan } from '@prisma/client';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
});

export { stripe };

const PRICE_TO_PLAN: Record<string, Plan> = {};

function buildPriceMap() {
  if (env.STRIPE_STARTER_MONTHLY_PRICE_ID) {
    PRICE_TO_PLAN[env.STRIPE_STARTER_MONTHLY_PRICE_ID] = 'STARTER';
  }
  if (env.STRIPE_PRO_MONTHLY_PRICE_ID) {
    PRICE_TO_PLAN[env.STRIPE_PRO_MONTHLY_PRICE_ID] = 'PRO';
  }
}
buildPriceMap();

export async function createCheckoutSession(
  userId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { userId },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customerId },
    });
  }

  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    metadata: { userId },
    allow_promotion_codes: true,
  });
}

export async function createPortalSession(
  userId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.stripeCustomerId) {
    throw new Error('No Stripe customer found');
  }
  return stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: returnUrl,
  });
}

export async function handleWebhookEvent(rawBody: Buffer, signature: string): Promise<void> {
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    logger.warn({ msg }, 'Stripe webhook signature verification failed');
    throw new Error(`Webhook signature invalid: ${msg}`);
  }

  logger.info({ type: event.type }, 'Processing Stripe webhook');

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const subId = session.subscription as string;
      const customerId = session.customer as string;
      if (subId && customerId) {
        await syncSubscription(customerId, subId);
      }
      break;
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object;
      await syncSubscription(sub.customer as string, sub.id);
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      await downgradeToFree(sub.customer as string);
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      logger.warn({ customerId: invoice.customer }, 'Invoice payment failed');
      break;
    }
  }
}

async function syncSubscription(customerId: string, subscriptionId: string): Promise<void> {
  const sub = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['items.data.price'],
  });

  const priceId = sub.items.data[0]?.price.id ?? '';
  const plan = PRICE_TO_PLAN[priceId] ?? 'FREE';

  await prisma.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: { plan, stripeSubId: subscriptionId },
  });

  logger.info({ customerId, plan, subscriptionId }, 'Subscription synced');
}

async function downgradeToFree(customerId: string): Promise<void> {
  await prisma.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: { plan: 'FREE', stripeSubId: null },
  });
  logger.info({ customerId }, 'Subscription deleted, downgraded to FREE');
}
