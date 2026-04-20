'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';
import { ExternalLink, Bell, Shield, CreditCard, Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface NotificationPrefs {
  jobMatches: boolean;
  assessmentReady: boolean;
  skillMilestones: boolean;
  weeklyDigest: boolean;
  marketingEmails: boolean;
}

interface UserSettings {
  notificationPrefs: NotificationPrefs;
  plan: string;
  stripeCustomerId: string | null;
}

const PREF_LABELS: Record<keyof NotificationPrefs, { label: string; desc: string }> = {
  jobMatches: { label: 'Job Matches', desc: 'Get notified when new jobs match your profile' },
  assessmentReady: { label: 'Assessment Ready', desc: 'When your AI results are ready' },
  skillMilestones: { label: 'Skill Milestones', desc: 'When you complete a skill on your roadmap' },
  weeklyDigest: { label: 'Weekly Digest', desc: 'Weekly summary of market trends and opportunities' },
  marketingEmails: { label: 'Product Updates', desc: 'New features and product announcements' },
};

export default function SettingsPage() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () =>
      apiClient.get<{ data: UserSettings }>('/users/me/settings').then((r) => r.data.data),
  });

  const updatePrefs = useMutation({
    mutationFn: (prefs: Partial<NotificationPrefs>) =>
      apiClient.patch('/users/me/settings/notifications', prefs).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Preferences saved');
    },
    onError: () => toast.error('Failed to save preferences'),
  });

  const openBillingPortal = useMutation({
    mutationFn: () =>
      apiClient.post<{ data: { url: string } }>('/payments/portal').then((r) => r.data.data),
    onSuccess: ({ url }) => window.open(url, '_blank'),
    onError: () => toast.error('Failed to open billing portal'),
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const prefs = settings?.notificationPrefs;

  const togglePref = (key: keyof NotificationPrefs) => {
    if (!prefs) return;
    updatePrefs.mutate({ [key]: !prefs[key] });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
      </div>

      {/* Billing */}
      <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-6">
        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <CreditCard className="h-4 w-4" /> Billing
        </h2>
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
          <div>
            <p className="font-medium text-gray-900 dark:text-white capitalize">
              {settings?.plan?.toLowerCase() || 'free'} Plan
            </p>
            <p className="text-sm text-gray-500">
              {settings?.plan === 'FREE'
                ? 'Upgrade to unlock more features'
                : 'Manage your subscription below'}
            </p>
          </div>
          <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full font-medium capitalize">
            {settings?.plan || 'FREE'}
          </span>
        </div>
        {settings?.plan === 'FREE' ? (
          <a
            href="/billing"
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 text-sm text-center block"
          >
            Upgrade Plan
          </a>
        ) : (
          <button
            onClick={() => openBillingPortal.mutate()}
            disabled={openBillingPortal.isPending}
            className="w-full py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 text-sm flex items-center justify-center gap-2"
          >
            {openBillingPortal.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4" />
            )}
            Manage Subscription
          </button>
        )}
      </div>

      {/* Notifications */}
      <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-6">
        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <Bell className="h-4 w-4" /> Notifications
        </h2>
        <div className="space-y-4">
          {prefs &&
            (Object.keys(PREF_LABELS) as Array<keyof NotificationPrefs>).map((key) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {PREF_LABELS[key].label}
                  </p>
                  <p className="text-xs text-gray-500">{PREF_LABELS[key].desc}</p>
                </div>
                <button
                  onClick={() => togglePref(key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    prefs[key] ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      prefs[key] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Account */}
      <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4" /> Account
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Email</p>
              <p className="text-xs text-gray-500">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
            <span className="text-xs text-gray-400">Managed by Clerk</span>
          </div>

          {!deleteConfirm ? (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </button>
          ) : (
            <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
              <p className="text-sm text-red-700 dark:text-red-400 mb-3">
                This will permanently delete your account and all data. This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="flex-1 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    toast.error('Account deletion is disabled in this environment.');
                    setDeleteConfirm(false);
                  }}
                  className="flex-1 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
