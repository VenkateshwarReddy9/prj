import Link from 'next/link';

export const revalidate = 3600;

const POSTS = [
  {
    slug: 'how-ai-is-changing-career-navigation',
    title: 'How AI Is Changing Career Navigation',
    excerpt: 'The old playbook for job searching — spray and pray with resumes — is giving way to a smarter, data-driven approach powered by AI.',
    date: '2026-01-15',
    author: 'Sarah Chen',
    category: 'Career Advice',
    readTime: '5 min',
  },
  {
    slug: 'ats-optimization-guide',
    title: 'The Complete ATS Optimization Guide for 2026',
    excerpt: 'Applicant tracking systems reject up to 75% of resumes before a human reads them. Here\'s how to make yours stand out.',
    date: '2026-01-22',
    author: 'Marcus Rivera',
    category: 'Resume Tips',
    readTime: '8 min',
  },
  {
    slug: 'salary-negotiation-using-data',
    title: 'Negotiate Your Salary Using Real Market Data',
    excerpt: 'Walking into a salary negotiation without market data is like playing poker without looking at your cards. We\'ll show you how to build your case.',
    date: '2026-02-01',
    author: 'Priya Patel',
    category: 'Compensation',
    readTime: '6 min',
  },
  {
    slug: 'skills-gap-analysis',
    title: 'How to Identify and Close Your Skill Gaps',
    excerpt: 'Most people are 3–5 skills away from their dream role. A systematic skill gap analysis is the fastest way to figure out exactly what those skills are.',
    date: '2026-02-10',
    author: 'Sarah Chen',
    category: 'Skill Development',
    readTime: '7 min',
  },
  {
    slug: 'ai-interview-prep',
    title: 'Using AI to Ace Behavioral Interviews',
    excerpt: 'Behavioral interviews follow predictable patterns. AI-powered practice lets you rehearse real answers and get feedback before the real thing.',
    date: '2026-02-20',
    author: 'Marcus Rivera',
    category: 'Interview Prep',
    readTime: '5 min',
  },
  {
    slug: 'remote-job-market-2026',
    title: 'The State of Remote Work in 2026',
    excerpt: 'Remote job postings have stabilized at 15% of all listings — but the competition for them is fierce. Here\'s where the real opportunities are hiding.',
    date: '2026-03-01',
    author: 'Priya Patel',
    category: 'Job Market',
    readTime: '6 min',
  },
];

const CATEGORIES = ['All', 'Career Advice', 'Resume Tips', 'Compensation', 'Skill Development', 'Interview Prep', 'Job Market'];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navbar */}
      <nav className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-blue-600">CareerCompass</Link>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</Link>
            <Link href="/sign-in" className="text-sm px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">Sign In</Link>
            <Link href="/sign-up" className="text-sm px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Get Started Free</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">CareerCompass Blog</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Actionable career advice, job market insights, and AI career strategies.
          </p>
        </div>

        {/* Category filter — static for now, can be made interactive */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <span
              key={cat}
              className={`px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer ${
                cat === 'All'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat}
            </span>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {POSTS.map((post) => (
            <article
              key={post.slug}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Placeholder hero image */}
              <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 flex items-center justify-center">
                <span className="text-4xl">
                  {post.category === 'Career Advice' ? '🧭'
                    : post.category === 'Resume Tips' ? '📄'
                    : post.category === 'Compensation' ? '💰'
                    : post.category === 'Skill Development' ? '📈'
                    : post.category === 'Interview Prep' ? '🎤'
                    : '🌍'}
                </span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-400">{post.readTime} read</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-snug">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-bold text-blue-600">
                      {post.author.charAt(0)}
                    </div>
                    <span className="text-xs text-gray-500">{post.author}</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
