import pdfParse from 'pdf-parse';
import { anthropicService } from '../ai/anthropic.service.js';
import {
  RESUME_ATS_SYSTEM_PROMPT,
  buildResumeATSPrompt,
} from '../../prompts/resume-ats.js';
import { AI_MODELS } from '@careercompass/constants';
import type { ParsedResumeData, ResumeATSIssue } from '@careercompass/types';
import { logger } from '../../lib/logger.js';

interface ResumeAnalysisResult {
  parsedText: string;
  parsedData: ParsedResumeData;
  atsScore: number;
  atsIssues: ResumeATSIssue[];
}

interface ATSAnalysisResponse {
  atsScore: number;
  categoryScores: Record<string, number>;
  parsedData: ParsedResumeData;
  issues: ResumeATSIssue[];
  missingKeywords: string[];
  topStrengths: string[];
}

export async function parseAndAnalyzeResume(
  pdfBuffer: Buffer,
  userId: string,
  targetRole?: string,
  targetJobDescription?: string
): Promise<ResumeAnalysisResult> {
  // Extract text from PDF
  let parsedText = '';
  try {
    const pdfData = await pdfParse(pdfBuffer);
    parsedText = pdfData.text;
  } catch (err) {
    logger.error({ err }, 'PDF parsing failed');
    throw new Error('Failed to parse PDF. Please ensure it is a valid PDF file.');
  }

  if (!parsedText || parsedText.trim().length < 100) {
    throw new Error('Resume appears to be empty or image-based. Please upload a text-based PDF.');
  }

  // Analyze with Claude Haiku (fast and cost-effective for parsing)
  const { data } = await anthropicService.createJsonMessage<ATSAnalysisResponse>({
    model: AI_MODELS.SONNET,
    system: RESUME_ATS_SYSTEM_PROMPT,
    userMessage: buildResumeATSPrompt(parsedText, targetRole, targetJobDescription),
    maxTokens: 4000,
    userId,
    feature: 'resume',
  });

  return {
    parsedText,
    parsedData: data.parsedData,
    atsScore: data.atsScore,
    atsIssues: data.issues ?? [],
  };
}
