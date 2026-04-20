'use client';

import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Check, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { PLAN_FEATURES } from '@careercompass/constants';

const PLANS = [
  { id: 'FREE', name: 'Free', price: '$0', desc: 'Perfect for exploring' },
  { id: 'STARTER', name: 'Starter', price: '$19/mo', desc: 'For active job seekers' },
  { id: 'PRO', name: 'Pro', price: '$49/mo', desc: 'For serious career growth' },
];

export default function BillingPage() {
  const { user } = useUser();
  const currentPlan = (user?.unsafeMetadata?.['plan'] as string) ?? 'FREE';

  const { data: usage } = useQuery({
    queryKey: ['usage'],
    queryFn: () =>
      apiClient.get<{ data: { assessmentsThisMonth: number; chatMessagesThisMonth: number } }>('/users/me/usage').then((r) => r.data.data),
  });

  const createPortal = useMutation({
    mutationFn: () =>
      apiClient
        .post<{ data: { url: string } }>('/billing/portal', {
          returnUrl: window.location.href,
        })
        .then((r) => r.data.data),
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
    onError: () => toast.error('Failed to open billing portal'),
  });

  const checkout = useMutation({
    mutationFn: (planId: 'STARTER' | 'PRO') =>
      apiClient
        .post<{ data: { url: string } }>('/billing/checkout', {
          planId,
          interval: 'monthly',
          successUrl: window.location.origin + '/dashboard?upgraded=1',
          cancelUrl: window.location.href,
        })
        .then((r) => r.data.data),
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
    onError: () => toast.error('Failed to start checkout'),
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing & Plan</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your subscription and usage.
        </p>
      </div>

      {/* Current usage */}
      {usage && (
        <div className="p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-8">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">This Month's Usage</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Assessments</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {usage.assessmentsThisMonth}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">AI Chat Messages</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {usage.chatMessagesThisMonth}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Plan cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {PLANS.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id;
          const features = PLAN_FEATURES[plan.id as keyof typeof PLAN_FEATURES];

          return (
            <div
              key={plan.id}
              className={`p-6 rounded-xl border-2 transition-all ${
                isCurrentPlan
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'
              }`}
            >
              {isCurrentPlan && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded-full mb-3">
                  <Zap className="h-3 w-3" />
                  Current Plan
                </span>
              )}
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h3>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
                {plan.price}
              </p>
              <p className="text-sm text-gray-500 mt-1 mb-4">{plan.desc}</p>
              <ul className="space-y-2 mb-6">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              {plan.id !== 'FREE' && !isCurrentPlan && (
                <button
                  onClick={() => checkout.mutate(plan.id as 'STARTER' | 'PRO')}
                  disabled={checkout.isPending}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                >
                  Upgrade to {plan.name}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {currentPlan !== 'FREE' && (
        <div className="text-center">
          <button
            onClick={() => createPortal.mutate()}
            disabled={createPortal.isPending}
            className="text-sm text-gray-600 hover:underline"
          >
            Manage subscription, change payment method, or cancel →
          </button>
        </div>
      )}
    </div>
  );
}
