export interface ResumeATSIssue {
  category: 'formatting' | 'keywords' | 'content' | 'structure' | 'quantification';
  severity: 'critical' | 'warning' | 'suggestion';
  section: string;
  issue: string;
  suggestion: string;
}

export interface ParsedResumeData {
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedin: string | null;
  summary: string | null;
  experience: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate: string | null;
    current: boolean;
    bullets: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    gpa?: string;
  }>;
  skills: string[];
  certifications: string[];
}

export interface Resume {
  id: string;
  userId: string;
  filename: string;
  storageKey: string;
  parsedText: string | null;
  parsedData: ParsedResumeData | null;
  atsScore: number | null;
  atsIssues: ResumeATSIssue[] | null;
  optimized: boolean;
  optimizedKey: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeOptimizationResult {
  originalScore: number;
  optimizedScore: number;
  improvements: Array<{
    section: string;
    original: string;
    optimized: string;
    reason: string;
  }>;
  addedKeywords: string[];
  storageKey: string;
}
