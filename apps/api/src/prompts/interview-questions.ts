type InterviewType = 'BEHAVIORAL' | 'TECHNICAL' | 'CASE' | 'MIXED';

export const INTERVIEW_SYSTEM_PROMPT = `You are a senior hiring manager and career coach with expertise in conducting and evaluating interviews across many industries. Generate realistic, challenging interview questions.

IMPORTANT: Respond with valid JSON only.`;

export function buildInterviewQuestionsPrompt(
  type: InterviewType,
  targetRole: string,
  company?: string
): string {
  const typeDescriptions: Record<InterviewType, string> = {
    BEHAVIORAL: 'behavioral (STAR method — Situation, Task, Action, Result)',
    TECHNICAL: 'technical (role-specific technical knowledge and problem-solving)',
    CASE: 'case study (analytical problem-solving and business scenarios)',
    MIXED: 'mixed (combination of behavioral, technical, and case study)',
  };

  return `Generate 15 ${typeDescriptions[type]} interview questions for a ${targetRole} position${company ? ` at ${company}` : ''}.

Return a JSON object with this structure:
{
  "questions": [
    {
      "id": "string (q1, q2, etc.)",
      "question": "string (the actual interview question)",
      "category": "string (e.g. 'Leadership', 'Technical', 'Problem Solving', 'Culture Fit')",
      "difficulty": "easy|medium|hard",
      "tips": ["string (1-3 tips for answering well)"],
      "starFramework": {
        "situation": "string (example situation setup — for behavioral/situational only, else null)",
        "task": "string",
        "action": "string",
        "result": "string"
      }
    }
  ]
}

Make the questions specific to the ${targetRole} role. Include 5 easy, 7 medium, and 3 hard questions.
For BEHAVIORAL/SITUATIONAL questions, always include a starFramework example.
For TECHNICAL questions, the starFramework can be null.`;
}

export const INTERVIEW_EVALUATION_SYSTEM_PROMPT = `You are an expert interview coach who gives honest, constructive feedback on interview answers. You help candidates understand what great answers look like.

IMPORTANT: Respond with valid JSON only.`;

export function buildInterviewEvaluationPrompt(
  question: string,
  answer: string,
  targetRole: string
): string {
  return `Evaluate this interview answer for a ${targetRole} candidate.

Question: ${question}

Candidate's Answer:
"""
${answer}
"""

Return a JSON object with this structure:
{
  "score": number (0-100),
  "feedback": "string (2-3 paragraphs of specific, constructive feedback)",
  "strengths": ["string (1-3 specific things they did well)"],
  "improvements": ["string (1-3 specific areas to improve)"],
  "improvedExample": "string (a model answer that would score 90+, specific to their situation)"
}

Be honest. A score of 70+ means they would likely pass this question. Below 50 means significant work needed.
The improved example should be substantively better, not just longer.`;
}
