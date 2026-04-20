export type AppStatus = 'SAVED' | 'APPLIED' | 'INTERVIEWING' | 'OFFER' | 'REJECTED';

export interface SavedJob {
  id: string;
  userId: string;
  externalId: string;
  source: string;
  title: string;
  company: string;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  description: string | null;
  url: string;
  status: AppStatus;
  notes: string | null;
  appliedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobSearchResult {
  id: string;
  externalId: string;
  source: string;
  title: string;
  company: string;
  location: string;
  salaryMin: number | null;
  salaryMax: number | null;
  description: string;
  url: string;
  remote: boolean;
  postedAt: string;
  matchScore?: number;
}

export interface JobSearchFilters {
  query?: string;
  location?: string;
  remote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  experienceLevel?: string;
  industry?: string;
  page?: number;
  limit?: number;
}

export interface KanbanColumn {
  status: AppStatus;
  label: string;
  jobs: SavedJob[];
}
