export type Plan = 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';

export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  plan: Plan;
  stripeCustomerId: string | null;
  stripeSubId: string | null;
  onboardingDone: boolean;
  currentTitle: string | null;
  targetRole: string | null;
  yearsExp: number | null;
  skills: string[];
  location: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  assessmentCount: number;
  savedJobCount: number;
  resumeCount: number;
}

export interface OnboardingData {
  name: string;
  location: string;
  currentTitle: string;
  targetRole: string;
  yearsExp: number;
  skills: string[];
}

export interface UpdateProfileData {
  name?: string;
  location?: string;
  currentTitle?: string;
  targetRole?: string;
  yearsExp?: number;
  skills?: string[];
  avatarUrl?: string;
}
