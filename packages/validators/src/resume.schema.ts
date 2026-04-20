import { z } from 'zod';

export const OptimizeResumeSchema = z.object({
  targetRole: z.string().min(1).max(300).optional(),
  targetJobDescription: z.string().max(5000).optional(),
  focusAreas: z
    .array(z.enum(['keywords', 'formatting', 'impact', 'skills', 'summary']))
    .optional(),
});

export type OptimizeResumeInput = z.infer<typeof OptimizeResumeSchema>;
