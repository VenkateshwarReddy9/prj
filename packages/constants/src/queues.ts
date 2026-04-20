export const QUEUE_NAMES = {
  AI_ASSESSMENT: 'ai-assessment',
  EMBEDDINGS: 'embeddings',
  RESUME_PARSE: 'resume-parse',
  EMAIL: 'email',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

export const QUEUE_OPTIONS = {
  [QUEUE_NAMES.AI_ASSESSMENT]: {
    attempts: 3,
    backoff: { type: 'exponential' as const, delay: 2000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
  [QUEUE_NAMES.EMBEDDINGS]: {
    attempts: 3,
    backoff: { type: 'exponential' as const, delay: 1000 },
    removeOnComplete: { count: 200 },
    removeOnFail: { count: 50 },
  },
  [QUEUE_NAMES.RESUME_PARSE]: {
    attempts: 3,
    backoff: { type: 'exponential' as const, delay: 1500 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
  [QUEUE_NAMES.EMAIL]: {
    attempts: 5,
    backoff: { type: 'exponential' as const, delay: 5000 },
    removeOnComplete: { count: 500 },
    removeOnFail: { count: 100 },
  },
};
