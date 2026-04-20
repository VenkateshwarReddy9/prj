import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('stripe', () => {
  const mockCheckoutCreate = vi.fn();
  const mockPortalCreate = vi.fn();
  const mockSubscriptionRetrieve = vi.fn();
  const mockCustomerCreate = vi.fn();

  const StripeMock = vi.fn().mockImplementation(() => ({
    checkout: { sessions: { create: mockCheckoutCreate } },
    billingPortal: { sessions: { create: mockPortalCreate } },
    subscriptions: { retrieve: mockSubscriptionRetrieve },
    customers: { create: mockCustomerCreate },
    webhooks: {
      constructEvent: vi.fn().mockReturnValue({ type: 'invoice.paid', data: { object: {} } }),
    },
  }));

  return {
    default: StripeMock,
    __mockCheckoutCreate: mockCheckoutCreate,
    __mockPortalCreate: mockPortalCreate,
  };
});

vi.mock('../../config/env.js', () => ({
  env: {
    STRIPE_SECRET_KEY: 'sk_test_placeholder',
    STRIPE_WEBHOOK_SECRET: 'whsec_placeholder',
    STRIPE_STARTER_PRICE_ID: 'price_starter',
    STRIPE_PRO_PRICE_ID: 'price_pro',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  },
}));

import { StripeService } from '../billing/stripe.service.js';

describe('StripeService', () => {
  let service: StripeService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new StripeService();
  });

  describe('createCheckoutSession', () => {
    it('creates a checkout session and returns the URL', async () => {
      const Stripe = (await import('stripe')).default as ReturnType<typeof vi.fn>;
      const instance = new Stripe('key');
      (instance.checkout.sessions.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        url: 'https://checkout.stripe.com/test',
        id: 'cs_test_123',
      });

      const result = await service.createCheckoutSession({
        userId: 'user_1',
        email: 'user@example.com',
        plan: 'STARTER',
        customerId: null,
      });

      expect(result.url).toBe('https://checkout.stripe.com/test');
    });
  });

  describe('createPortalSession', () => {
    it('creates a portal session for existing customer', async () => {
      const Stripe = (await import('stripe')).default as ReturnType<typeof vi.fn>;
      const instance = new Stripe('key');
      (instance.billingPortal.sessions.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        url: 'https://billing.stripe.com/portal/test',
      });

      const result = await service.createPortalSession({
        customerId: 'cus_123',
        returnUrl: 'http://localhost:3000/settings',
      });

      expect(result.url).toContain('stripe.com');
    });
  });
});
