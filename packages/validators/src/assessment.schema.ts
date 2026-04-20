import { z } from 'zod';

export const AssessmentAnswerSchema = z.object({
  questionId: z.string().min(1),
  answer: z.union([z.string(), z.array(z.string())]),
});

export const SaveAssessmentAnswersSchema = z.object({
  answers: z.array(AssessmentAnswerSchema).min(1).max(8),
  step: z.number().int().min(1).max(8),
});

export const SubmitAssessmentSchema = z.object({
  answers: z.array(AssessmentAnswerSchema).length(8),
});

export type AssessmentAnswerInput = z.infer<typeof AssessmentAnswerSchema>;
export type SaveAssessmentAnswersInput = z.infer<typeof SaveAssessmentAnswersSchema>;
export type SubmitAssessmentInput = z.infer<typeof SubmitAssessmentSchema>;
