import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Welcome back! Here's your career overview.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[
          {
            href: '/dashboard/assessment/new',
            icon: '🧭',
            title: 'Take Assessment',
            desc: 'Discover your ideal career path',
            cta: 'Start Now',
            color: 'blue',
          },
          {
            href: '/dashboard/jobs',
            icon: '💼',
            title: 'Find Jobs',
            desc: 'Browse AI-matched opportunities',
            cta: 'Search Jobs',
            color: 'green',
          },
          {
            href: '/dashboard/resume',
            icon: '📄',
            title: 'Optimize Resume',
            desc: 'Get your ATS score and feedback',
            cta: 'Upload Resume',
            color: 'purple',
          },
          {
            href: '/dashboard/chat',
            icon: '💬',
            title: 'AI Career Coach',
            desc: 'Chat with your personal AI coach',
            cta: 'Start Chat',
            color: 'indigo',
          },
          {
            href: '/dashboard/interview',
            icon: '🎤',
            title: 'Interview Prep',
            desc: 'Practice with AI feedback',
            cta: 'Prepare Now',
            color: 'orange',
          },
          {
            href: '/dashboard/skills',
            icon: '📊',
            title: 'Skill Roadmap',
            desc: 'Track your learning progress',
            cta: 'View Roadmap',
            color: 'teal',
          },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all group"
          >
            <div className="text-3xl mb-3">{card.icon}</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{card.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{card.desc}</p>
            <span className="text-sm font-medium text-blue-600 group-hover:underline">
              {card.cta} →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
