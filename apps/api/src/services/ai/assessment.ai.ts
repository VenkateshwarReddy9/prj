import { anthropicService } from './anthropic.service.js';
import { prisma } from '../../config/prisma.js';
import { logger } from '../../lib/logger.js';
import {
  ASSESSMENT_SYSTEM_PROMPT,
  buildAssessmentAnalysisPrompt,
} from '../../prompts/assessment-analysis.js';
import { AI_MODELS } from '@careercompass/constants';
import type { AssessmentAnswer, AssessmentResult } from '@careercompass/types';

export async function generateAssessmentResults(
  assessmentId: string,
  userId: string,
  answers: AssessmentAnswer[]
): Promise<AssessmentResult> {
  const userMessage = buildAssessmentAnalysisPrompt(answers);

  const { data, usage } = await anthropicService.createJsonMessage<AssessmentResult>({
    model: AI_MODELS.SONNET,
    system: ASSESSMENT_SYSTEM_PROMPT,
    userMessage,
    maxTokens: 6000,
    userId,
    feature: 'assessment',
  });

  // Update assessment with token count
  await prisma.assessment.update({
    where: { id: assessmentId },
    data: { tokensUsed: usage.totalTokens },
  });

  logger.info(
    { assessmentId, tokensUsed: usage.totalTokens, costUsd: usage.costUsd },
    'Assessment analysis complete'
  );

  return data;
}
