'use client';

import { AssessmentWizard } from '@/components/assessment/AssessmentWizard';

export default function NewAssessmentPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Career Assessment</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Answer 8 questions to get your personalized career roadmap powered by AI.
        </p>
      </div>
      <AssessmentWizard />
    </div>
  );
}
