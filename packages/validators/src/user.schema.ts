import { z } from 'zod';

export const OnboardingSchema = z.object({
  name: z.string().min(1).max(100),
  location: z.string().min(1).max(200),
  currentTitle: z.string().max(200).optional().default(''),
  targetRole: z.string().min(1).max(200),
  yearsExp: z.number().int().min(0).max(50),
  skills: z.array(z.string()).max(30).optional().default([]),
  goals: z.array(z.string()).max(30).optional().default([]),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  location: z.string().min(2).max(200).optional(),
  currentTitle: z.string().min(2).max(200).optional(),
  targetRole: z.string().min(2).max(200).optional(),
  yearsExp: z.number().int().min(0).max(50).optional(),
  skills: z.array(z.string()).min(0).max(30).optional(),
  avatarUrl: z.string().url().optional(),
});

export type OnboardingInput = z.infer<typeof OnboardingSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
