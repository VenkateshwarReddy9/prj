'use client';

import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import {
  Compass,
  Briefcase,
  FileText,
  MessageSquare,
  Mic,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Target,
  Zap,
} from 'lucide-react';

interface UsageData {
  assessmentsThisMonth: number;
  chatMessagesThisMonth: number;
  resumeUploads: number;
  interviewSessionsThisMonth: number;
  savedJobs: number;
  aiTokensUsed: number;
  aiCostUsd: number;
}

interface UserProfile {
  id: string;
  name: string | null;
  targetRole: string | null;
  currentTitle: string | null;
  plan: string;
  onboardingDone: boolean;
  _count: {
    assessments: number;
    savedJobs: number;
    resumes: number;
  };
}

const QUICK_ACTIONS = [
  {
    href: '/assessment/new',
    icon: Compass,
    title: 'Take Assessment',
    desc: 'Discover your career archetype in 5 minutes',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    href: '/jobs',
    icon: Briefcase,
    title: 'Find Jobs',
    desc: 'AI-matched opportunities from top boards',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    href: '/resume',
    icon: FileText,
    title: 'Optimize Resume',
    desc: 'Get your ATS score and feedback',
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    href: '/chat',
    icon: MessageSquare,
    title: 'AI Career Coach',
    desc: 'Chat with your personal coach 24/7',
    gradient: 'from-indigo-500 to-purple-600',
  },
  {
    href: '/interview',
    icon: Mic,
    title: 'Interview Prep',
    desc: 'Practice with AI feedback',
    gradient: 'from-orange-500 to-red-600',
  },
  {
    href: '/skills',
    icon: TrendingUp,
    title: 'Skill Roadmap',
    desc: 'Track your learning progress',
    gradient: 'from-teal-500 to-cyan-600',
  },
];

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { user: clerkUser } = useUser();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () =>
      apiClient.get<{ data: UserProfile }>('/users/me').then((r) => r.data.data),
  });

  const { data: usage } = useQuery({
    queryKey: ['usage'],
    queryFn: () =>
      apiClient.get<{ data: UsageData }>('/users/me/usage').then((r) => r.data.data),
  });

  const firstName = profile?.name?.split(' ')[0] ?? clerkUser?.firstName ?? 'there';
  const hasCompletedAssessment = (profile?._count?.assessments ?? 0) > 0;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {firstName} 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {profile?.targetRole
            ? `You're on the path to becoming a ${profile.targetRole}.`
            : "Let's navigate your career journey together."}
        </p>
      </div>

      {/* Onboarding CTA — only shown if they haven't done assessment */}
      {!hasCompletedAssessment && (
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-medium mb-3">
              <Sparkles className="h-3 w-3" /> Get started
            </div>
            <h2 className="text-xl font-bold mb-2">Take your first career assessment</h2>
            <p className="text-blue-100 mb-4 max-w-lg">
              In just 5 minutes, Claude AI will analyze your profile and give you a personalized career archetype, 10 job recommendations, and a custom skill roadmap.
            </p>
            <Link
              href="/assessment/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
            >
              Start Assessment <Zap className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Stats */}
      {usage && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={CheckCircle2}
            label="Assessments"
            value={profile?._count?.assessments ?? 0}
            sub={`${usage.assessmentsThisMonth} this month`}
            color="bg-blue-500"
          />
          <StatCard
            icon={Briefcase}
            label="Saved Jobs"
            value={usage.savedJobs}
            color="bg-emerald-500"
          />
          <StatCard
            icon={FileText}
            label="Resumes"
            value={usage.resumeUploads}
            color="bg-purple-500"
          />
          <StatCard
            icon={Target}
            label="AI Credits Used"
            value={(usage.aiTokensUsed / 1000).toFixed(1) + 'k'}
            sub={`$${usage.aiCostUsd.toFixed(2)}`}
            color="bg-orange-500"
          />
        </div>
      )}

      {/* Quick actions */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">What would you like to do?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="group relative p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div
                className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${action.gradient} mb-4`}
              >
                <Icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{action.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{action.desc}</p>
              <span className="text-sm font-medium text-blue-600 group-hover:gap-2 inline-flex items-center gap-1 transition-all">
                Get started →
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
