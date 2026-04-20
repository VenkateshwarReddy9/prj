export interface SalaryData {
  role: string;
  location: string;
  p10: number;
  p25: number;
  median: number;
  p75: number;
  p90: number;
  currency: string;
  source: string;
  updatedAt: string;
}

export interface HiringTrend {
  role: string;
  period: string;
  jobPostings: number;
  growthRate: number;
  topSkillsDemanded: string[];
  topCompaniesHiring: string[];
}

export interface MarketInsights {
  salaryData: SalaryData | null;
  hiringTrend: HiringTrend | null;
  demandScore: number;
  competitionLevel: 'low' | 'medium' | 'high' | 'very_high';
  topLocations: Array<{ city: string; country: string; jobCount: number }>;
}
