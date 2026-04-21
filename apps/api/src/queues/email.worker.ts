import { Worker } from 'bullmq';
import { getRedisConnection } from '../config/redis.js';
import { QUEUE_NAMES } from '@careercompass/constants';
import {
  sendWelcomeEmail,
  sendAssessmentCompleteEmail,
  sendJobMatchEmail,
} from '../services/notification/email.service.js';
import { logger } from '../lib/logger.js';
import type { EmailJobData } from './index.js';

export function createEmailWorker() {
  const worker = new Worker<EmailJobData>(
    QUEUE_NAMES.EMAIL,
    async (job) => {
      const { type, to, payload } = job.data;
      logger.info({ jobId: job.id, type, to }, 'Processing email job');

      switch (type) {
        case 'welcome':
          await sendWelcomeEmail(to, payload['name'] as string);
          break;
        case 'assessment_complete':
          await sendAssessmentCompleteEmail(
            to,
            payload['name'] as string,
            payload['archetype'] as string
          );
          break;
        case 'job_match':
          await sendJobMatchEmail(
            to,
            payload['name'] as string,
            payload['jobTitle'] as string,
            payload['company'] as string,
            payload['matchScore'] as number
          );
          break;
        default:
          logger.warn({ type }, 'Unknown email job type');
      }
    },
    {
      connection: getRedisConnection(),
      concurrency: 5,
    }
  );

  worker.on('completed', (job) => {
    logger.info({ jobId: job.id, type: job.data.type }, 'Email job completed');
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, type: job?.data.type, err }, 'Email job failed');
  });

  return worker;
}
