import { z } from 'zod';

export const StartInterviewSchema = z.object({
  type: z.enum(['BEHAVIORAL', 'TECHNICAL', 'SITUATIONAL', 'MIXED']),
  targetRole: z.string().min(1).max(300),
  company: z.string().max(300).optional(),
});

export const SubmitAnswerSchema = z.object({
  questionId: z.string().min(1),
  answer: z.string().min(10).max(5000),
});

export type StartInterviewInput = z.infer<typeof StartInterviewSchema>;
export type SubmitAnswerInput = z.infer<typeof SubmitAnswerSchema>;
