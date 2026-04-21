import Link from 'next/link';
import { Check } from 'lucide-react';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Try CareerCompass with no commitment.',
    cta: 'Get Started Free',
    href: '/sign-up',
    highlight: false,
    features: [
      '1 career assessment',
      '5 job matches',
      '20 AI chat messages',
      '1 resume upload',
      'Basic skill roadmap',
      'Community support',
    ],
  },
  {
    name: 'Starter',
    price: '$19',
    period: 'per month',
    description: 'For active job seekers ready to accelerate.',
    cta: 'Start Starter Plan',
    href: '/sign-up?plan=STARTER',
    highlight: false,
    features: [
      '3 career assessments/mo',
      '20 job matches/mo',
      '100 AI chat messages/mo',
      '3 resume uploads',
      'Full skill roadmap',
      'Interview practice',
      'Email support',
    ],
  },
  {
    name: 'Pro',
    price: '$49',
    period: 'per month',
    description: 'Unlimited access for serious career growth.',
    cta: 'Start Pro Plan',
    href: '/sign-up?plan=PRO',
    highlight: true,
    features: [
      'Unlimited assessments',
      'Unlimited job matches',
      'Unlimited AI chat',
      '10 resume uploads',
      'Priority job alerts',
      'Advanced interview AI',
      'Market insights & salary data',
      'Priority support',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    description: 'For teams and organizations at scale.',
    cta: 'Contact Sales',
    href: 'mailto:sales@careercompass.ai',
    highlight: false,
    features: [
      'Everything in Pro',
      'Unlimited team seats',
      'Custom integrations',
      'Dedicated success manager',
      'SSO / SAML',
      'SLA & uptime guarantee',
      'Invoice billing',
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navbar */}
      <nav className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-blue-600">
            CareerCompass
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-sm px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">
              Sign In
            </Link>
            <Link href="/sign-up" className="text-sm px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Start free. Upgrade when you need more. Cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-6 flex flex-col ${
                plan.highlight
                  ? 'bg-blue-600 text-white ring-2 ring-blue-600 shadow-xl'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h3
                  className={`text-lg font-bold mb-1 ${
                    plan.highlight ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`text-sm mb-4 ${
                    plan.highlight ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-4xl font-extrabold ${
                      plan.highlight ? 'text-white' : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-sm ${
                      plan.highlight ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    /{plan.period}
                  </span>
                </div>
              </div>

              <ul className="flex-1 space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check
                      className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                        plan.highlight ? 'text-blue-200' : 'text-green-500'
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        plan.highlight ? 'text-blue-50' : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block text-center py-3 px-4 rounded-xl font-semibold text-sm transition-colors ${
                  plan.highlight
                    ? 'bg-white text-blue-600 hover:bg-blue-50'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            All plans include a 14-day money-back guarantee. Questions?{' '}
            <a href="mailto:support@careercompass.ai" className="text-blue-600 hover:underline">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
