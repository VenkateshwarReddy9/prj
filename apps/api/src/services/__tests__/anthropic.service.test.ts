import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnthropicService } from '../ai/anthropic.service.js';

// Mock the Anthropic SDK
vi.mock('@anthropic-ai/sdk', () => {
  const mockCreate = vi.fn();
  const mockStream = vi.fn();
  return {
    default: vi.fn().mockImplementation(() => ({
      messages: {
        create: mockCreate,
        stream: mockStream,
      },
    })),
    __mockCreate: mockCreate,
    __mockStream: mockStream,
  };
});

vi.mock('../../config/env.js', () => ({
  env: {
    ANTHROPIC_API_KEY: 'sk-ant-test',
    NODE_ENV: 'test',
  },
}));

vi.mock('../../lib/cost-calculator.js', () => ({
  calculateCostUsd: vi.fn().mockReturnValue(0.001),
}));

const mockResponse = {
  content: [{ type: 'text', text: '{"result": "ok"}' }],
  usage: { input_tokens: 100, output_tokens: 50 },
  model: 'claude-sonnet-4-20250514',
};

describe('AnthropicService', () => {
  let service: AnthropicService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const Anthropic = (await import('@anthropic-ai/sdk')).default as ReturnType<typeof vi.fn>;
    const instance = new Anthropic();
    (instance.messages.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);
    service = new AnthropicService();
  });

  describe('createJsonMessage', () => {
    it('parses JSON response and returns structured data', async () => {
      const result = await service.createJsonMessage<{ result: string }>({
        system: 'You are a career coach.',
        userMessage: 'Analyze this profile.',
      });

      expect(result.data).toEqual({ result: 'ok' });
      expect(result.usage.inputTokens).toBe(100);
      expect(result.usage.outputTokens).toBe(50);
      expect(result.usage.totalTokens).toBe(150);
    });

    it('throws when response content is not text', async () => {
      const Anthropic = (await import('@anthropic-ai/sdk')).default as ReturnType<typeof vi.fn>;
      const instance = new Anthropic();
      (instance.messages.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: [{ type: 'tool_use', id: 'x', name: 'y', input: {} }],
        usage: { input_tokens: 10, output_tokens: 0 },
      });

      await expect(
        service.createJsonMessage({ system: 'sys', userMessage: 'msg' })
      ).rejects.toThrow('Unexpected response type');
    });
  });

  describe('streamMessage', () => {
    it('yields token events from the stream', async () => {
      async function* fakeStream() {
        yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Hello' } };
        yield { type: 'content_block_delta', delta: { type: 'text_delta', text: ' world' } };
      }

      const mockStreamObj = {
        [Symbol.asyncIterator]: fakeStream,
        finalUsage: vi.fn().mockResolvedValue({ input_tokens: 20, output_tokens: 10 }),
      };

      const Anthropic = (await import('@anthropic-ai/sdk')).default as ReturnType<typeof vi.fn>;
      const instance = new Anthropic();
      (instance.messages.stream as ReturnType<typeof vi.fn>).mockReturnValue(mockStreamObj);

      const tokens: string[] = [];
      for await (const event of service.streamMessage({
        system: 'sys',
        messages: [{ role: 'user', content: 'hi' }],
      })) {
        if (event.type === 'token') tokens.push(event.content);
      }

      expect(tokens).toEqual(['Hello', ' world']);
    });
  });
});
