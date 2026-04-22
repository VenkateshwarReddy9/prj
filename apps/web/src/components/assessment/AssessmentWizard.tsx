'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAssessmentStore } from '@/lib/stores/assessment.store';
import { apiClient } from '@/lib/api-client';
import { ASSESSMENT_QUESTIONS } from '@careercompass/constants';
import { QuestionStep } from './QuestionStep';
import { AssessmentProgress } from './AssessmentProgress';
import { toast } from 'sonner';

export function AssessmentWizard() {
  const router = useRouter();
  const { assessmentId, currentStep, answers, setAssessmentId, setCurrentStep, saveAnswer, setSubmitting, reset } =
    useAssessmentStore();
  const [jobId, setJobId] = useState<string | null>(null);

  const question = ASSESSMENT_QUESTIONS[currentStep - 1];
  const totalSteps = ASSESSMENT_QUESTIONS.length;
  const currentAnswer = answers.find((a) => a.questionId === question?.id);

  // Start assessment on mount if not already started
  useEffect(() => {
    if (!assessmentId) {
      apiClient.post<{ data: { id: string } }>('/assessments').then((r) => {
        setAssessmentId(r.data.data.id);
      });
    }
  }, [assessmentId, setAssessmentId]);

  const handleAnswer = (answer: string | string[]) => {
    if (!question) return;
    saveAnswer({ questionId: question.id, answer });

    // Auto-save to backend
    if (assessmentId) {
      apiClient.patch(`/assessments/${assessmentId}/answers`, {
        answers: [...answers.filter((a) => a.questionId !== question.id), { questionId: question.id, answer }],
        step: currentStep,
      }).catch(() => null);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!assessmentId) return;
    setSubmitting(true);

    try {
      const response = await apiClient.post<{ data: { assessmentId: string; jobId: string } }>(
        `/assessments/${assessmentId}/submit`,
        { answers }
      );
      setJobId(response.data.data.jobId);
      reset();
      router.push(`/assessment/${response.data.data.assessmentId}`);
    } catch {
      toast.error('Failed to submit assessment. Please try again.');
      setSubmitting(false);
    }
  };

  if (jobId) {
    return <AssessmentProgress jobId={jobId} assessmentId={assessmentId!} />;
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Progress bar */}
      <div className="px-8 pt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">
            Question {currentStep} of {totalSteps}
          </span>
          <span className="text-sm font-medium text-blue-600">
            {Math.round((currentStep / totalSteps) * 100)}% complete
          </span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-600 rounded-full"
            initial={false}
            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        {question && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="p-8"
          >
            <QuestionStep
              question={question}
              currentAnswer={currentAnswer?.answer}
              onAnswer={handleAnswer}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="px-8 pb-8 flex justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className="px-6 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          ← Back
        </button>

        {currentStep < totalSteps ? (
          <button
            onClick={handleNext}
            disabled={!currentAnswer}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg disabled:opacity-40 hover:bg-blue-700 transition-colors"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!currentAnswer || answers.length < totalSteps}
            className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-40 hover:bg-blue-700 transition-colors"
          >
            Get My Results ✨
          </button>
        )}
      </div>
    </div>
  );
}
