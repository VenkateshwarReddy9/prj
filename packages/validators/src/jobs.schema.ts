import { z } from 'zod';

export const JobSearchSchema = z.object({
  query: z.string().max(500).optional(),
  location: z.string().max(200).optional(),
  remote: z.boolean().optional(),
  salaryMin: z.number().int().min(0).optional(),
  salaryMax: z.number().int().min(0).optional(),
  experienceLevel: z
    .enum(['entry', 'mid', 'senior', 'lead', 'executive'])
    .optional(),
  industry: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const SaveJobSchema = z.object({
  externalId: z.string().min(1),
  source: z.string().min(1),
  title: z.string().min(1).max(300),
  company: z.string().min(1).max(300),
  location: z.string().max(300).optional(),
  salaryMin: z.number().int().min(0).optional(),
  salaryMax: z.number().int().min(0).optional(),
  description: z.string().max(10000).optional(),
  url: z.string().url(),
  remote: z.boolean().optional(),
});

export const UpdateJobStatusSchema = z.object({
  status: z.enum(['SAVED', 'APPLIED', 'INTERVIEWING', 'OFFER', 'REJECTED']),
  notes: z.string().max(2000).optional(),
  appliedAt: z.string().datetime().optional(),
});

export type JobSearchInput = z.infer<typeof JobSearchSchema>;
export type SaveJobInput = z.infer<typeof SaveJobSchema>;
export type UpdateJobStatusInput = z.infer<typeof UpdateJobStatusSchema>;
