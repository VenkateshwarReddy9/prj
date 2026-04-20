import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { createCheckoutSession, createPortalSession } from '../services/billing/stripe.service.js';
import { env } from '../config/env.js';
import { CheckoutSchema } from '@careercompass/validators';
import { PLAN_PRICES, PLAN_FEATURES } from '@careercompass/constants';

const router = Router();

router.get('/billing/plans', (_req, res) => {
  res.json({
    data: {
      plans: [
        {
          id: 'FREE',
          name: 'Free',
          price: 0,
          features: PLAN_FEATURES.FREE,
        },
        {
          id: 'STARTER',
          name: 'Starter',
          price: 19,
          priceAnnual: 159,
          stripeMonthlyPriceId: PLAN_PRICES.STARTER.monthly,
          features: PLAN_FEATURES.STARTER,
        },
        {
          id: 'PRO',
          name: 'Pro',
          price: 49,
          priceAnnual: 399,
          stripeMonthlyPriceId: PLAN_PRICES.PRO.monthly,
          features: PLAN_FEATURES.PRO,
        },
      ],
    },
  });
});

router.post('/billing/checkout', authenticate, validateBody(CheckoutSchema), async (req, res) => {
  const { planId, interval, successUrl, cancelUrl } = req.body;

  const planPrices = planId === 'STARTER' ? PLAN_PRICES.STARTER : PLAN_PRICES.PRO;
  const priceId = interval === 'annual' ? planPrices.annual : planPrices.monthly;

  const session = await createCheckoutSession(req.userId, priceId, successUrl, cancelUrl);

  res.json({ data: { url: session.url, sessionId: session.id } });
});

router.post('/billing/portal', authenticate, async (req, res) => {
  const returnUrl = (req.body as { returnUrl?: string }).returnUrl ?? env.FRONTEND_URL + '/dashboard/settings';
  const session = await createPortalSession(req.userId, returnUrl);
  res.json({ data: { url: session.url } });
});

export { router as billingRouter };
