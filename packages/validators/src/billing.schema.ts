import { z } from 'zod';

export const CheckoutSchema = z.object({
  planId: z.enum(['STARTER', 'PRO']),
  interval: z.enum(['monthly', 'annual']),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export type CheckoutInput = z.infer<typeof CheckoutSchema>;
