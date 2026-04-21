'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useUser } from '@clerk/nextjs';
import { Users, BarChart3, DollarSign, Cpu, Shield } from 'lucide-react';

interface AdminMetrics {
  totalUsers: number;
  newUsersThisMonth: number;
  assessmentsThisMonth: number;
  completedAssessments: number;
  aiCostLast30Days: number;
  aiTokensLast30Days: number;
  planBreakdown: Record<string, number>;
}

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  plan: string;
  createdAt: string;
  _count: { assessments: number; savedJobs: number };
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

const ADMIN_IDS = (process.env['NEXT_PUBLIC_ADMIN_USER_IDS'] ?? '').split(',').filter(Boolean);

export default function AdminPage() {
  const { user } = useUser();

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: () =>
      apiClient.get<{ data: AdminMetrics }>('/admin/metrics').then((r) => r.data.data),
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () =>
      apiClient
        .get<{ data: AdminUser[]; total: number }>('/admin/users?limit=20')
        .then((r) => r.data),
  });

  const isAdmin = !ADMIN_IDS.length || ADMIN_IDS.includes(user?.id ?? '');

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Shield className="h-12 w-12 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
        <p className="text-gray-500">You need admin privileges to view this page.</p>
      </div>
    );
  }

  if (metricsLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" /> Admin Dashboard
        </h1>
        <p className="text-gray-500 mt-1 text-sm">Platform metrics and user management</p>
      </div>

      {/* Metrics grid */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            icon={Users}
            label="Total Users"
            value={metrics.totalUsers.toLocaleString()}
            sub={`+${metrics.newUsersThisMonth} this month`}
          />
          <StatCard
            icon={BarChart3}
            label="Assessments (this month)"
            value={metrics.assessmentsThisMonth.toLocaleString()}
            sub={`${metrics.completedAssessments} completed total`}
          />
          <StatCard
            icon={DollarSign}
            label="AI Cost (30 days)"
            value={`$${metrics.aiCostLast30Days.toFixed(2)}`}
            sub={`${(metrics.aiTokensLast30Days / 1000).toFixed(0)}k tokens`}
          />
          <StatCard icon={Cpu} label="Free Users" value={metrics.planBreakdown['FREE'] ?? 0} />
          <StatCard icon={Cpu} label="Starter Users" value={metrics.planBreakdown['STARTER'] ?? 0} />
          <StatCard icon={Cpu} label="Pro Users" value={metrics.planBreakdown['PRO'] ?? 0} />
        </div>
      )}

      {/* Users table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Recent Users
            {usersData?.total ? (
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({usersData.total} total)
              </span>
            ) : null}
          </h2>
        </div>
        <div className="overflow-x-auto">
          {usersLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {['Name', 'Email', 'Plan', 'Assessments', 'Saved Jobs', 'Joined'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {(usersData?.data ?? []).map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {u.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.plan === 'PRO'
                            ? 'bg-purple-100 text-purple-700'
                            : u.plan === 'STARTER'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {u.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u._count.assessments}</td>
                    <td className="px-4 py-3 text-gray-500">{u._count.savedJobs}</td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
