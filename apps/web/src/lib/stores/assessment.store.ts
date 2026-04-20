import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AssessmentAnswer } from '@careercompass/types';

interface AssessmentState {
  assessmentId: string | null;
  currentStep: number;
  answers: AssessmentAnswer[];
  isSubmitting: boolean;
  setAssessmentId: (id: string) => void;
  setCurrentStep: (step: number) => void;
  saveAnswer: (answer: AssessmentAnswer) => void;
  setSubmitting: (submitting: boolean) => void;
  reset: () => void;
}

export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set) => ({
      assessmentId: null,
      currentStep: 1,
      answers: [],
      isSubmitting: false,
      setAssessmentId: (id) => set({ assessmentId: id }),
      setCurrentStep: (step) => set({ currentStep: step }),
      saveAnswer: (answer) =>
        set((state) => ({
          answers: [
            ...state.answers.filter((a) => a.questionId !== answer.questionId),
            answer,
          ],
        })),
      setSubmitting: (submitting) => set({ isSubmitting: submitting }),
      reset: () =>
        set({ assessmentId: null, currentStep: 1, answers: [], isSubmitting: false }),
    }),
    { name: 'assessment-progress' }
  )
);
