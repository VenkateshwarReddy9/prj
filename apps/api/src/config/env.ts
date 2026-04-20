import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),

  // Database
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1).optional().default(''),

  // Cache
  REDIS_URL: z.string().min(1),

  // Auth
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: z.string().min(1),

  // AI
  ANTHROPIC_API_KEY: z.string().min(1),
  VOYAGE_API_KEY: z.string().optional().default(''),

  // Vector DB
  PINECONE_API_KEY: z.string().optional().default(''),
  PINECONE_INDEX: z.string().optional().default('careercompass-jobs'),

  // Storage
  SUPABASE_URL: z.string().min(1),
  SUPABASE_SERVICE_KEY: z.string().min(1),

  // Payments
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  STRIPE_STARTER_MONTHLY_PRICE_ID: z.string().optional().default(''),
  STRIPE_PRO_MONTHLY_PRICE_ID: z.string().optional().default(''),

  // Email
  RESEND_API_KEY: z.string().optional().default(''),
  RESEND_FROM_EMAIL: z.string().optional().default('noreply@careercompass.ai'),

  // Job APIs
  ADZUNA_APP_ID: z.string().optional().default(''),
  ADZUNA_API_KEY: z.string().optional().default(''),
  JSEARCH_API_KEY: z.string().optional().default(''),

  // App
  FRONTEND_URL: z.string().min(1),

  // Observability
  SENTRY_DSN: z.string().optional(),
  POSTHOG_API_KEY: z.string().optional(),

  // Admin
  ADMIN_USER_IDS: z.string().optional().default(''),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Invalid environment variables:');
    for (const issue of result.error.issues) {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
  }
  return result.data;
}

export const env = validateEnv();

export type Env = typeof env;
