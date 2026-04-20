import { vi } from 'vitest';

// Prevent real DB/Redis connections in unit tests
vi.mock('../config/prisma.js', () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    assessment: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), count: vi.fn() },
    chatMessage: { count: vi.fn(), create: vi.fn() },
    tokenUsage: { create: vi.fn() },
    skillRoadmap: { findFirst: vi.fn() },
  },
}));

vi.mock('../config/redis.js', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    incr: vi.fn(),
    expire: vi.fn(),
    quit: vi.fn(),
  },
}));

// Silence pino logs in tests
vi.mock('../lib/logger.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    child: vi.fn(() => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    })),
  },
}));
