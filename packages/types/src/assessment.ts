export type AssessmentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface AssessmentAnswer {
  questionId: string;
  answer: string | string[];
}

export interface CareerArchetype {
  name: string;
  headline: string;
  summary: string;
  keyStrengths: string[];
  idealEnvironment: string;
  growthAreas: string[];
}

export interface JobRecommendation {
  id: string;
  title: string;
  company: string | null;
  description: string | null;
  matchScore: number;
  skillGaps: string[];
  salaryMin: number | null;
  salaryMax: number | null;
  location: string | null;
  remote: boolean;
  sourceUrl: string | null;
  whyItFits: string;
  growthTrajectory: string;
  requiredSkills: string[];
}

export interface SkillGap {
  skillName: string;
  category: string;
  currentLevel: number;
  targetLevel: number;
  priorityScore: number;
  estimatedWeeksToLearn: number;
  resources: LearningResource[];
}

export interface LearningResource {
  title: string;
  url: string;
  platform: string;
  type: 'course' | 'tutorial' | 'book' | 'video' | 'documentation';
  isFree: boolean;
  estimatedHours: number;
}

export interface AssessmentResult {
  archetype: CareerArchetype;
  jobRecommendations: JobRecommendation[];
  skillGaps: SkillGap[];
  topSkillsToLearn: string[];
  estimatedTimeToFirstRole: string;
}

export interface Assessment {
  id: string;
  userId: string;
  jobId: string | null;
  status: AssessmentStatus;
  answers: AssessmentAnswer[];
  result: AssessmentResult | null;
  tokensUsed: number;
  processingMs: number | null;
  errorMsg: string | null;
  createdAt: string;
  updatedAt: string;
}
