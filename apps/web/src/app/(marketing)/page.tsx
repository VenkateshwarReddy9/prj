import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navbar */}
      <nav className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <span className="text-xl font-bold text-blue-600">CareerCompass</span>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">
              Pricing
            </Link>
            <Link
              href="/sign-in"
              className="text-sm px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="text-sm px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-8">
          <span>Powered by Claude AI</span>
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
          Navigate Your Career
          <br />
          <span className="text-blue-600">With AI Precision</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-10">
          CareerCompass uses advanced AI to analyze your skills, match you with ideal roles, build
          personalized learning roadmaps, and coach you through every step of your career journey.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/sign-up"
            className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Start Free Assessment
          </Link>
          <Link
            href="/pricing"
            className="px-8 py-4 border border-gray-300 text-gray-700 dark:text-gray-300 text-lg font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            View Pricing
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Everything you need to accelerate your career
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: '🧭',
              title: 'Career Assessment',
              desc: '8-question adaptive assessment powered by Claude AI. Discover your career archetype, ideal roles, and personalized roadmap.',
            },
            {
              icon: '💼',
              title: 'Smart Job Matching',
              desc: 'AI-powered semantic job search matches you with roles that fit your unique profile. Live data from top job boards.',
            },
            {
              icon: '📄',
              title: 'Resume Optimizer',
              desc: 'Upload your resume and get an ATS compatibility score, section-by-section feedback, and AI-optimized rewrites.',
            },
            {
              icon: '🎤',
              title: 'Interview Prep',
              desc: 'Generate role-specific interview questions, practice with an AI evaluator, and get scored feedback to improve.',
            },
            {
              icon: '📊',
              title: 'Skill Roadmap',
              desc: 'Personalized learning roadmap with curated resources. Track progress, earn milestones, and close skill gaps faster.',
            },
            {
              icon: '💬',
              title: 'AI Career Coach',
              desc: 'Chat with your personal AI career coach 24/7. Get advice, feedback, and guidance tailored to your exact situation.',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-20 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">
          Ready to find your ideal career?
        </h2>
        <p className="text-blue-100 text-lg mb-8">
          Join thousands of professionals who found their path with CareerCompass.
        </p>
        <Link
          href="/sign-up"
          className="px-10 py-4 bg-white text-blue-600 text-lg font-bold rounded-xl hover:bg-blue-50 transition-colors"
        >
          Get Started Free
        </Link>
      </section>
    </div>
  );
}
