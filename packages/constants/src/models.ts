export const AI_MODELS = {
  SONNET: 'claude-sonnet-4-20250514',
  HAIKU: 'claude-haiku-4-5-20251001',
} as const;

export type AIModel = (typeof AI_MODELS)[keyof typeof AI_MODELS];

export const MODEL_COSTS_PER_MILLION_TOKENS = {
  [AI_MODELS.SONNET]: { input: 3.0, output: 15.0 },
  [AI_MODELS.HAIKU]: { input: 0.25, output: 1.25 },
} as const;

// Use Sonnet for heavy tasks, Haiku for fast/cheap operations
export const MODEL_ASSIGNMENTS = {
  assessmentAnalysis: AI_MODELS.SONNET,
  jobRecommendations: AI_MODELS.SONNET,
  skillGapAnalysis: AI_MODELS.SONNET,
  resumeScoring: AI_MODELS.SONNET,
  resumeOptimization: AI_MODELS.SONNET,
  chatResponse: AI_MODELS.SONNET,
  interviewQuestions: AI_MODELS.SONNET,
  interviewEvaluation: AI_MODELS.SONNET,
  resumeParsing: AI_MODELS.HAIKU,
  quickSuggestions: AI_MODELS.HAIKU,
} as const;
