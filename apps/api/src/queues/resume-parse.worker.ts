import { Worker, type Job } from 'bullmq';
import { getRedisConnection } from '../config/redis.js';
import { prisma } from '../config/prisma.js';
import { supabase } from '../config/supabase.js';
import { parseAndAnalyzeResume } from '../services/resume/pdf-parser.service.js';
import { logger } from '../lib/logger.js';
import { QUEUE_NAMES } from '@careercompass/constants';
import type { ResumeParseJobData } from './index.js';

async function processResumeParse(job: Job<ResumeParseJobData>) {
  const { resumeId, userId, storageKey, targetRole } = job.data;

  logger.info({ resumeId, userId }, 'Starting resume parse');

  try {
    // Download from Supabase Storage
    const { data: fileData, error } = await supabase.storage
      .from('resumes')
      .download(storageKey);

    if (error || !fileData) {
      throw new Error(`Failed to download resume: ${error?.message ?? 'No data'}`);
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());
    const result = await parseAndAnalyzeResume(buffer, userId, targetRole);

    await prisma.resume.update({
      where: { id: resumeId },
      data: {
        parsedText: result.parsedText,
        parsedData: result.parsedData as object,
        atsScore: result.atsScore,
        atsIssues: result.atsIssues as object[],
      },
    });

    logger.info({ resumeId, atsScore: result.atsScore }, 'Resume parse complete');
  } catch (err) {
    logger.error({ err, resumeId }, 'Resume parse failed');
    throw err;
  }
}

export function createResumeParseWorker() {
  return new Worker<ResumeParseJobData>(QUEUE_NAMES.RESUME_PARSE, processResumeParse, {
    connection: getRedisConnection(),
    concurrency: 5,
  });
}
