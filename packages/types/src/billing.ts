import type { Plan } from './user.js';

export interface BillingInfo {
  plan: Plan;
  stripeCustomerId: string | null;
  stripeSubId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface CheckoutRequest {
  planId: 'STARTER' | 'PRO';
  interval: 'monthly' | 'annual';
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResponse {
  url: string;
  sessionId: string;
}

export interface UsageStats {
  assessmentsThisMonth: number;
  chatMessagesThisMonth: number;
  resumeUploads: number;
  interviewSessionsThisMonth: number;
  savedJobs: number;
  aiTokensUsed: number;
  aiCostUsd: number;
}
