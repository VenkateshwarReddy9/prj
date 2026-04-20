import { anthropicService } from './anthropic.service.js';
import {
  INTERVIEW_SYSTEM_PROMPT,
  INTERVIEW_EVALUATION_SYSTEM_PROMPT,
  buildInterviewQuestionsPrompt,
  buildInterviewEvaluationPrompt,
} from '../../prompts/interview-questions.js';
import { AI_MODELS } from '@careercompass/constants';
import type { InterviewType } from '@prisma/client';
import type { InterviewQuestion, AnswerEvaluation } from '@careercompass/types';

interface QuestionsResponse {
  questions: InterviewQuestion[];
}

export async function generateInterviewQuestions(
  type: InterviewType,
  targetRole: string,
  userId: string,
  company?: string
): Promise<InterviewQuestion[]> {
  const { data } = await anthropicService.createJsonMessage<QuestionsResponse>({
    model: AI_MODELS.SONNET,
    system: INTERVIEW_SYSTEM_PROMPT,
    userMessage: buildInterviewQuestionsPrompt(type, targetRole, company),
    maxTokens: 4000,
    userId,
    feature: 'interview',
  });
  return data.questions;
}

export async function evaluateInterviewAnswer(
  question: string,
  answer: string,
  targetRole: string,
  userId: string
): Promise<AnswerEvaluation> {
  const { data } = await anthropicService.createJsonMessage<AnswerEvaluation>({
    model: AI_MODELS.SONNET,
    system: INTERVIEW_EVALUATION_SYSTEM_PROMPT,
    userMessage: buildInterviewEvaluationPrompt(question, answer, targetRole),
    maxTokens: 2000,
    userId,
    feature: 'interview',
  });
  return data;
}
