export type AIStreamEvent =
  | { type: 'start'; model: string }
  | { type: 'token'; content: string }
  | { type: 'done'; usage: { inputTokens: number; outputTokens: number; costUsd: number } }
  | { type: 'error'; message: string };

export interface AIUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
  model: string;
}

export interface AIJsonResponse<T> {
  data: T;
  usage: AIUsage;
  processingMs: number;
}
