import { Redis } from 'ioredis';
import { env } from './env.js';

const globalForRedis = globalThis as unknown as { redis: Redis };

export const redis =
  globalForRedis.redis ??
  new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
  });

if (env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

redis.on('error', (err: Error) => {
  console.error('Redis connection error:', err.message);
});

export function getRedisConnection() {
  return new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
}
