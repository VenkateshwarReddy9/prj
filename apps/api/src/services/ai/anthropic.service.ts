import Anthropic from '@anthropic-ai/sdk';
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages.js';
import { env } from '../../config/env.js';
import { prisma } from '../../config/prisma.js';
import { logger } from '../../lib/logger.js';
import { calculateCostUsd } from '../../lib/cost-calculator.js';
import { AI_MODELS } from '@careercompass/constants';
import type { AIModel } from '@careercompass/constants';
import type { AIUsage, AIStreamEvent } from '@careercompass/types';

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;
const RETRYABLE_STATUS = new Set([429, 500, 529]);

export class AnthropicService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }

  /**
   * Call Claude and return a complete JSON response. Retries on transient errors.
   */
  async createJsonMessage<T>(params: {
    model?: AIModel;
    system: string;
    userMessage: string;
    maxTokens?: number;
    userId?: string;
    feature?: string;
  }): Promise<{ data: T; usage: AIUsage }> {
    const model = params.model ?? AI_MODELS.SONNET;
    const messages: MessageParam[] = [{ role: 'user', content: params.userMessage }];

    const response = await this.withRetry(() =>
      this.client.messages.create({
        model,
        max_tokens: params.maxTokens ?? 4096,
        system: params.system,
        messages,
      })
    );

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    const usage: AIUsage = {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      costUsd: calculateCostUsd(model, response.usage.input_tokens, response.usage.output_tokens),
      model,
    };

    if (params.userId && params.feature) {
      this.trackUsage(params.userId, params.feature, usage).catch((err) =>
        logger.warn({ err }, 'Failed to track token usage')
      );
    }

    let parsed: T;
    try {
      // Claude sometimes wraps JSON in code blocks
      const jsonText = content.text
        .replace(/^```json\s*/m, '')
        .replace(/^```\s*/m, '')
        .replace(/```\s*$/m, '')
        .trim();
      parsed = JSON.parse(jsonText) as T;
    } catch {
      logger.error({ text: content.text }, 'Failed to parse AI JSON response');
      throw new Error('AI returned invalid JSON');
    }

    return { data: parsed, usage };
  }

  /**
   * Stream Claude responses as an async generator yielding AIStreamEvent tokens.
   * Caller can push tokens to Socket.IO or SSE.
   */
  async *streamMessage(params: {
    model?: AIModel;
    system: string;
    messages: MessageParam[];
    maxTokens?: number;
    userId?: string;
    feature?: string;
  }): AsyncGenerator<AIStreamEvent> {
    const model = params.model ?? AI_MODELS.SONNET;

    yield { type: 'start', model };

    let inputTokens = 0;
    let outputTokens = 0;

    try {
      const stream = await this.withRetry(() =>
        this.client.messages.stream({
          model,
          max_tokens: params.maxTokens ?? 2048,
          system: params.system,
          messages: params.messages,
        })
      );

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          yield { type: 'token', content: event.delta.text };
        }
        if (event.type === 'message_start') {
          inputTokens = event.message.usage.input_tokens;
        }
        if (event.type === 'message_delta') {
          outputTokens = event.usage.output_tokens;
        }
      }

      const costUsd = calculateCostUsd(model, inputTokens, outputTokens);
      const usage: AIUsage = {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        costUsd,
        model,
      };

      yield { type: 'done', usage: { inputTokens, outputTokens, costUsd } };

      if (params.userId && params.feature) {
        this.trackUsage(params.userId, params.feature, usage).catch((err) =>
          logger.warn({ err }, 'Failed to track stream token usage')
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI streaming error';
      yield { type: 'error', message };
      throw err;
    }
  }

  private async withRetry<T>(fn: () => Promise<T>, attempt = 0): Promise<T> {
    try {
      return await fn();
    } catch (err) {
      const status = (err as { status?: number }).status;
      if (attempt < MAX_RETRIES && status && RETRYABLE_STATUS.has(status)) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt);
        logger.warn({ attempt, status, delay }, 'Anthropic API error, retrying...');
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.withRetry(fn, attempt + 1);
      }
      throw err;
    }
  }

  private async trackUsage(userId: string, feature: string, usage: AIUsage): Promise<void> {
    await prisma.tokenUsage.create({
      data: {
        userId,
        feature,
        model: usage.model,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        costUsd: usage.costUsd,
      },
    });
  }
}

export const anthropicService = new AnthropicService();
