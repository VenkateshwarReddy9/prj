import { Queue } from 'bullmq';
import { getRedisConnection } from '../config/redis.js';
import { QUEUE_NAMES, QUEUE_OPTIONS } from '@careercompass/constants';

const connection = getRedisConnection();

export const assessmentQueue = new Queue(QUEUE_NAMES.AI_ASSESSMENT, {
  connection,
  defaultJobOptions: QUEUE_OPTIONS[QUEUE_NAMES.AI_ASSESSMENT],
});

export const embeddingQueue = new Queue(QUEUE_NAMES.EMBEDDINGS, {
  connection,
  defaultJobOptions: QUEUE_OPTIONS[QUEUE_NAMES.EMBEDDINGS],
});

export const resumeParseQueue = new Queue(QUEUE_NAMES.RESUME_PARSE, {
  connection,
  defaultJobOptions: QUEUE_OPTIONS[QUEUE_NAMES.RESUME_PARSE],
});

export const emailQueue = new Queue(QUEUE_NAMES.EMAIL, {
  connection,
  defaultJobOptions: QUEUE_OPTIONS[QUEUE_NAMES.EMAIL],
});

export interface AssessmentJobData {
  assessmentId: string;
  userId: string;
  answers: Array<{ questionId: string; answer: string | string[] }>;
}

export interface ResumeParseJobData {
  resumeId: string;
  userId: string;
  storageKey: string;
  targetRole?: string;
}

export interface EmailJobData {
  type: 'welcome' | 'assessment_complete' | 'job_match';
  to: string;
  payload: Record<string, unknown>;
}
