import { Worker } from 'bullmq';
import { getRedisConnection } from '../config/redis.js';
import { QUEUE_NAMES } from '@careercompass/constants';
import { embed, upsertToPinecone, type EmbeddingMetadata } from '../services/embedding.service.js';
import { logger } from '../lib/logger.js';

export interface EmbeddingJobData {
  id: string;
  text: string;
  metadata: EmbeddingMetadata;
}

export function createEmbeddingWorker() {
  const worker = new Worker<EmbeddingJobData>(
    QUEUE_NAMES.EMBEDDINGS,
    async (job) => {
      const { id, text, metadata } = job.data;
      logger.info({ jobId: job.id, embeddingId: id }, 'Processing embedding job');

      const vector = await embed(text);
      await upsertToPinecone(id, vector, metadata);

      logger.info({ jobId: job.id, embeddingId: id }, 'Embedding job complete');
    },
    {
      connection: getRedisConnection(),
      concurrency: 3,
    }
  );

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'Embedding job failed');
  });

  return worker;
}
