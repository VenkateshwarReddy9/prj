import { AI_MODELS, MODEL_COSTS_PER_MILLION_TOKENS } from '@careercompass/constants';
import type { AIModel } from '@careercompass/constants';

export function calculateCostUsd(
  model: AIModel | string,
  inputTokens: number,
  outputTokens: number
): number {
  const costs =
    MODEL_COSTS_PER_MILLION_TOKENS[model as AIModel] ??
    MODEL_COSTS_PER_MILLION_TOKENS[AI_MODELS.SONNET];

  return (inputTokens * costs.input + outputTokens * costs.output) / 1_000_000;
}
