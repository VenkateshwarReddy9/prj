import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  checkoutCreate: vi.fn(),
  portalCreate: vi.fn(),
  subscriptionRetrieve: vi.fn(),
  customerCreate: vi.fn(),
  constructEvent: vi.fn(),
  userFindUniqueOrThrow: vi.fn(),
  userUpdate: vi.fn(),
  userUpdateMany: vi.fn(),
}));

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    checkout: { sessions: { create: mocks.checkoutCreate } },
    billingPortal: { sessions: { create: mocks.portalCreate } },
    subscriptions: { retrieve: mocks.subscriptionRetrieve },
    customers: { create: mocks.customerCreate },
    webhooks: { constructEvent: mocks.constructEvent },
  })),
}));

vi.mock('../../config/env.js', () => ({
  env: {
    STRIPE_SECRET_KEY: 'sk_test_placeholder',
    STRIPE_WEBHOOK_SECRET: 'whsec_placeholder',
    STRIPE_STARTER_MONTHLY_PRICE_ID: 'price_starter',
    STRIPE_PRO_MONTHLY_PRICE_ID: 'price_pro',
    FRONTEND_URL: 'http://localhost:3000',
  },
}));

vi.mock('../../config/prisma.js', () => ({
  prisma: {
    user: {
      findUniqueOrThrow: mocks.userFindUniqueOrThrow,
      update: mocks.userUpdate,
      updateMany: mocks.userUpdateMany,
    },
  },
}));

import { createCheckoutSession, createPortalSession } from '../billing/stripe.service.js';

describe('stripe.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createCheckoutSession', () => {
    it('creates a checkout session for a user with no existing customer', async () => {
      mocks.userFindUniqueOrThrow.mockResolvedValue({
        id: 'user_1',
        email: 'user@example.com',
        name: 'Test User',
        stripeCustomerId: null,
      });
      mocks.customerCreate.mockResolvedValue({ id: 'cus_new' });
      mocks.checkoutCreate.mockResolvedValue({
        url: 'https://checkout.stripe.com/test',
        id: 'cs_test_123',
      });

      const result = await createCheckoutSession(
        'user_1',
        'price_starter',
        'http://localhost:3000/success',
        'http://localhost:3000/cancel'
      );

      expect(result.url).toBe('https://checkout.stripe.com/test');
      expect(mocks.customerCreate).toHaveBeenCalled();
      expect(mocks.checkoutCreate).toHaveBeenCalled();
    });
  });

  describe('createPortalSession', () => {
    it('creates a portal session for existing customer', async () => {
      mocks.userFindUniqueOrThrow.mockResolvedValue({
        id: 'user_1',
        stripeCustomerId: 'cus_123',
      });
      mocks.portalCreate.mockResolvedValue({
        url: 'https://billing.stripe.com/portal/test',
      });

      const result = await createPortalSession('user_1', 'http://localhost:3000/settings');

      expect(result.url).toContain('stripe.com');
    });

    it('throws when user has no stripe customer', async () => {
      mocks.userFindUniqueOrThrow.mockResolvedValue({
        id: 'user_1',
        stripeCustomerId: null,
      });

      await expect(
        createPortalSession('user_1', 'http://localhost:3000/settings')
      ).rejects.toThrow('No Stripe customer found');
    });
  });
});
