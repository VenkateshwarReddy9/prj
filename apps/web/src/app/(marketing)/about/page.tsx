import Link from 'next/link';

const TEAM = [
  { name: 'Sarah Chen', role: 'CEO & Co-founder', bio: 'Former engineering manager at Google. Passionate about democratizing career growth.' },
  { name: 'Marcus Rivera', role: 'CTO & Co-founder', bio: 'Built AI systems at OpenAI. Leads the Claude AI integration and infrastructure.' },
  { name: 'Priya Patel', role: 'Head of Product', bio: 'Ex-PM at LinkedIn. Obsessed with building tools that actually change career trajectories.' },
];

const VALUES = [
  { title: 'AI-first, human-centered', desc: 'We use AI to multiply human potential, not replace human judgment. Every insight is designed to empower, not overwhelm.' },
  { title: 'Radical transparency', desc: "We show our work. Salary ranges, demand scores, skill gaps — all with clear sourcing so you can trust what you're seeing." },
  { title: 'Accessible to all', desc: 'Career coaching has historically been expensive and exclusive. We believe everyone deserves personalized, expert-level career guidance.' },
  { title: 'Built in the open', desc: 'We share our methodology, publish what we learn, and actively listen to the job seekers and hiring managers who use CareerCompass.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navbar */}
      <nav className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-blue-600">
            CareerCompass
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</Link>
            <Link href="/sign-in" className="text-sm px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">Sign In</Link>
            <Link href="/sign-up" className="text-sm px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* Mission */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6">
          We&apos;re on a mission to give everyone
          <br />
          <span className="text-blue-600">a brilliant career advisor</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          For too long, top-tier career coaching has been reserved for those with the right connections
          or the money to pay $500/hr advisors. CareerCompass changes that by combining the best of
          Claude AI with real labor market data — available to everyone, at any career stage.
        </p>
      </section>

      {/* Values */}
      <section className="bg-gray-50 dark:bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            What we believe
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{v.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
          Meet the team
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {TEAM.map((member) => (
            <div key={member.name} className="text-center">
              <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-2xl font-bold text-blue-600 dark:text-blue-300 mx-auto mb-4">
                {member.name.charAt(0)}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{member.name}</h3>
              <p className="text-sm text-blue-600 mb-2">{member.role}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Join us on the journey</h2>
        <p className="text-blue-100 mb-8">Start your free career assessment today.</p>
        <Link
          href="/sign-up"
          className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors"
        >
          Get Started Free
        </Link>
      </section>
    </div>
  );
}
