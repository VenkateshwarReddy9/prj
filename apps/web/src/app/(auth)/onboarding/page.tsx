'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/lib/api-client';
import { ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';

const steps = [
  { id: 1, title: 'Welcome', subtitle: "Let's personalize your experience" },
  { id: 2, title: 'Your Role', subtitle: 'Tell us about your current position' },
  { id: 3, title: 'Career Goals', subtitle: 'Where do you want to go?' },
  { id: 4, title: 'Experience', subtitle: 'How long have you been working?' },
  { id: 5, title: "You're all set!", subtitle: 'Ready to accelerate your career' },
];

const EXPERIENCE_OPTIONS = ['0–1 years', '1–3 years', '3–5 years', '5–10 years', '10+ years'];
const GOAL_OPTIONS = [
  'Get promoted',
  'Switch industries',
  'Land my first tech job',
  'Increase salary',
  'Start freelancing',
  'Move to management',
  'Find remote work',
  'Build a startup',
];

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  location: z.string().min(1, 'Location is required'),
  currentTitle: z.string().optional(),
  targetRole: z.string().min(1, 'Target role is required'),
  yearsExp: z.string().min(1, 'Select your experience level'),
  goals: z.array(z.string()).min(1, 'Select at least one goal'),
});

type FormData = z.infer<typeof schema>;

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.fullName ?? '',
      goals: [],
    },
  });

  const complete = useMutation({
    mutationFn: (data: FormData) =>
      apiClient.post('/users/onboarding', {
        name: data.name,
        location: data.location,
        currentTitle: data.currentTitle || '',
        targetRole: data.targetRole,
        yearsExp: Math.max(0, EXPERIENCE_OPTIONS.indexOf(data.yearsExp)),
        skills: [],
        goals: data.goals,
      }),
    onSuccess: () => router.push('/dashboard'),
  });

  const goNext = async () => {
    let valid = true;
    if (step === 1) valid = await trigger(['name', 'location']);
    if (step === 2) valid = await trigger(['currentTitle', 'targetRole']);
    if (step === 3) valid = selectedGoals.length > 0;
    if (step === 4) valid = await trigger(['yearsExp']);
    if (!valid) return;
    setDirection(1);
    setStep((s) => s + 1);
  };

  const goPrev = () => {
    setDirection(-1);
    setStep((s) => s - 1);
  };

  const toggleGoal = (goal: string) => {
    const next = selectedGoals.includes(goal)
      ? selectedGoals.filter((g) => g !== goal)
      : [...selectedGoals, goal];
    setSelectedGoals(next);
    setValue('goals', next);
  };

  const onSubmit = (data: FormData) => {
    complete.mutate({ ...data, goals: selectedGoals });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex gap-2 mb-3">
            {steps.map((s) => (
              <div
                key={s.id}
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                  s.id <= step ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500 text-right">Step {step} of {steps.length}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {steps[step - 1].title}
              </h2>
              <p className="text-gray-500 mb-8">{steps[step - 1].subtitle}</p>

              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      {...register('name')}
                      placeholder="Jane Smith"
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Location
                    </label>
                    <input
                      {...register('location')}
                      placeholder="San Francisco, CA"
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.location && (
                      <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Current Title (optional)
                    </label>
                    <input
                      {...register('currentTitle')}
                      placeholder="e.g. Software Engineer"
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Target Role
                    </label>
                    <input
                      {...register('targetRole')}
                      placeholder="e.g. Staff Engineer, Product Manager"
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.targetRole && (
                      <p className="text-red-500 text-xs mt-1">{errors.targetRole.message}</p>
                    )}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <p className="text-sm text-gray-500 mb-3">Select all that apply</p>
                  <div className="grid grid-cols-2 gap-2">
                    {GOAL_OPTIONS.map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => toggleGoal(goal)}
                        className={`px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-colors ${
                          selectedGoals.includes(goal)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                  {errors.goals && (
                    <p className="text-red-500 text-xs mt-2">{errors.goals.message as string}</p>
                  )}
                </div>
              )}

              {step === 4 && (
                <div className="space-y-2">
                  {EXPERIENCE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setValue('yearsExp', opt)}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-medium text-left transition-colors ${
                        getValues('yearsExp') === opt
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {step === 5 && (
                <div className="text-center py-4">
                  <div className="text-6xl mb-4">🚀</div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Your profile is ready. Take your first career assessment to get a personalized roadmap.
                  </p>
                  <p className="text-sm text-gray-500">It only takes about 5 minutes.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-3 mt-8">
            {step > 1 && step < 5 && (
              <button
                type="button"
                onClick={goPrev}
                className="flex items-center gap-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
            )}
            {step < 5 ? (
              <button
                type="button"
                onClick={goNext}
                className="flex-1 flex items-center justify-center gap-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={complete.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {complete.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Start My Journey
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
