import Link from 'next/link';
import {
  Compass,
  Briefcase,
  FileText,
  MessageSquare,
  Mic,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Zap,
  Clock,
  ArrowRight,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Compass,
    title: 'Career Assessment',
    desc: '8-question adaptive assessment powered by Claude AI. Get your career archetype, personalized job matches, and skill roadmap in 5 minutes.',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    icon: Briefcase,
    title: 'Smart Job Matching',
    desc: 'AI semantic search across Adzuna and JSearch. Match scores based on your profile, skills, and career goals — not just keywords.',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    icon: FileText,
    title: 'Resume Optimizer',
    desc: 'Upload your resume, get an ATS score with section-by-section feedback, and let AI rewrite weak sections to land more interviews.',
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    icon: Mic,
    title: 'Interview Prep',
    desc: 'Role-specific behavioral and technical questions. Practice with real-time AI evaluation and feedback scored on clarity, depth, and STAR format.',
    gradient: 'from-orange-500 to-red-600',
  },
  {
    icon: TrendingUp,
    title: 'Skill Roadmap',
    desc: 'Personalized learning path from your current role to your target role. Curated resources, progress tracking, and milestone badges.',
    gradient: 'from-teal-500 to-cyan-600',
  },
  {
    icon: MessageSquare,
    title: 'AI Career Coach',
    desc: 'Chat with your personal AI career coach 24/7. Get advice tailored to your exact situation, goals, and skill gaps — not generic tips.',
    gradient: 'from-indigo-500 to-purple-600',
  },
];

const STATS = [
  { value: '10k+', label: 'Professionals guided' },
  { value: '94%', label: 'Report salary growth' },
  { value: '3.2×', label: 'Faster job placement' },
  { value: '4.9/5', label: 'Average rating' },
];

const TESTIMONIALS = [
  {
    quote:
      'The skill roadmap pinpointed exactly what I was missing to land a Staff Engineer role. Got an offer 6 weeks later with a 32% raise.',
    name: 'Maya R.',
    role: 'Staff Engineer @ Series B startup',
    avatar: 'M',
    color: 'bg-blue-500',
  },
  {
    quote:
      "I'd been stuck at the resume stage for months. CareerCompass's ATS feedback got me from 12 → 87 in a week. Interviews started pouring in.",
    name: 'David K.',
    role: 'Senior PM, Fintech',
    avatar: 'D',
    color: 'bg-purple-500',
  },
  {
    quote:
      'The AI coach felt like having a mentor who actually knew my situation. Made me realize I was undervaluing myself in negotiations by $40k.',
    name: 'Priya S.',
    role: 'ML Engineer, FAANG',
    avatar: 'P',
    color: 'bg-emerald-500',
  },
];

const TRUST_LOGOS = ['Google', 'Meta', 'Stripe', 'Linear', 'Vercel', 'Shopify'];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🧭</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">CareerCompass</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/pricing" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              Pricing
            </Link>
            <Link href="/blog" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              Blog
            </Link>
            <Link href="/about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              About
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="text-sm px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center relative overflow-hidden">
        <div className="absolute inset-x-0 -top-40 -z-10 overflow-hidden blur-3xl">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-400 to-indigo-500 opacity-20" />
        </div>

        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-8">
          <Sparkles className="h-3.5 w-3.5" />
          Powered by Claude AI — your personal career team
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white leading-[1.05] mb-6 tracking-tight">
          Your career deserves
          <br />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            a brilliant advisor.
          </span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
          CareerCompass uses Claude AI to analyze your skills, match you with ideal roles, build your personalized learning roadmap, and coach you through every step — at 1% of the cost of a human career coach.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/sign-up"
            className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 inline-flex items-center justify-center gap-2"
          >
            Start Free Assessment
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/pricing"
            className="px-8 py-4 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-lg font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            See Pricing
          </Link>
        </div>
        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            No credit card
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-blue-500" />
            5-minute assessment
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-orange-500" />
            Free forever plan
          </span>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/10 dark:via-indigo-900/10 dark:to-purple-900/10 border border-blue-100 dark:border-blue-900/30">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
                {s.value}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust logos */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center text-sm text-gray-500 mb-6">Our users work at:</p>
        <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
          {TRUST_LOGOS.map((logo) => (
            <span key={logo} className="text-xl font-bold text-gray-400 dark:text-gray-600">
              {logo}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Your entire career team, in one tab
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Six AI-powered tools that replace an expensive career coach, resume writer, interview prep service, and recruiter — all working together.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div
                  className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4`}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Real results, real people
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              What our users say about their career journey
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800"
              >
                <div className="flex gap-1 mb-3 text-yellow-400">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-5 leading-relaxed text-sm">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full ${t.color} text-white flex items-center justify-center font-bold`}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Go from stuck to shipping offers
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">Three steps. Zero fluff.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 relative">
          {[
            {
              step: '1',
              title: 'Answer 8 questions',
              desc: 'Our adaptive assessment figures out where you are, where you want to go, and what is holding you back.',
            },
            {
              step: '2',
              title: 'Get your AI career plan',
              desc: 'Claude generates your archetype, 10 hand-matched jobs, a skill roadmap, and a resume ATS score — all in under 30 seconds.',
            },
            {
              step: '3',
              title: 'Execute with a coach',
              desc: 'Chat with your AI coach, practice interviews, optimize applications. We follow up as market conditions change.',
            },
          ].map((item) => (
            <div key={item.step} className="text-center relative">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xl font-bold mb-4 shadow-lg shadow-blue-500/30">
                {item.step}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Your next career move starts now.
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of professionals using Claude AI to land better roles, negotiate bigger
            offers, and build futures they love.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-10 py-4 bg-white text-blue-600 text-lg font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-xl"
          >
            Get Started Free
            <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="text-blue-200 text-sm mt-4">Free forever • No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧭</span>
            <span className="font-bold text-gray-900 dark:text-white">CareerCompass</span>
            <span className="text-sm text-gray-500 ml-3">© 2026 · Built with Claude AI</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/pricing">Pricing</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/about">About</Link>
            <Link href="/sign-in">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
