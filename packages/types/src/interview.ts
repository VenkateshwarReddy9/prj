export type InterviewType = 'BEHAVIORAL' | 'TECHNICAL' | 'SITUATIONAL' | 'MIXED';

export interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  tips: string[];
  starFramework?: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
}

export interface InterviewAnswer {
  questionId: string;
  answer: string;
  score: number | null;
  feedback: string | null;
  improvedExample: string | null;
  evaluatedAt: string | null;
}

export interface InterviewSession {
  id: string;
  userId: string;
  type: InterviewType;
  targetRole: string;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  overallScore: number | null;
  feedback: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface StartInterviewRequest {
  type: InterviewType;
  targetRole: string;
  company?: string;
}

export interface SubmitAnswerRequest {
  questionId: string;
  answer: string;
}

export interface AnswerEvaluation {
  questionId: string;
  score: number;
  feedback: string;
  improvedExample: string;
  strengths: string[];
  improvements: string[];
}
