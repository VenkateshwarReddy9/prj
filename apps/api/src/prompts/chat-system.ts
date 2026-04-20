import type { AssessmentResult } from '@careercompass/types';

interface UserContext {
  name: string | null;
  currentTitle: string | null;
  targetRole: string | null;
  yearsExp: number | null;
  location: string | null;
  skills: string[];
}

export function buildChatSystemPrompt(
  user: UserContext,
  latestResult?: AssessmentResult | null
): string {
  const userContext = [
    user.name ? `Name: ${user.name}` : null,
    user.currentTitle ? `Current role: ${user.currentTitle}` : null,
    user.targetRole ? `Target role: ${user.targetRole}` : null,
    user.yearsExp != null ? `Experience: ${user.yearsExp} years` : null,
    user.location ? `Location: ${user.location}` : null,
    user.skills.length > 0 ? `Skills: ${user.skills.join(', ')}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const assessmentContext = latestResult
    ? `
Career Assessment Results:
- Career Archetype: ${latestResult.archetype.name}
- Archetype Headline: ${latestResult.archetype.headline}
- Key Strengths: ${latestResult.archetype.keyStrengths.join(', ')}
- Top Skill Gaps: ${latestResult.skillGaps
        .slice(0, 3)
        .map((s) => s.skillName)
        .join(', ')}
- Top Job Recommendation: ${latestResult.jobRecommendations[0]?.title ?? 'N/A'}
`
    : '';

  return `You are a world-class AI career coach with 20 years of experience. You are having a personalized coaching conversation with a user. Be warm, direct, encouraging, and specific to their situation.

User Profile:
${userContext}
${assessmentContext}

Guidelines:
- Give specific, actionable advice tailored to this user's actual situation
- Be concise but thorough — long essays are less helpful than clear action items
- When discussing jobs or salaries, be realistic and data-driven
- Gently challenge assumptions when you spot them
- Celebrate wins and progress
- Use markdown formatting for lists and headers when helpful
- Never give generic advice that ignores their specific context`;
}

export function buildInterviewSystemPrompt(targetRole: string, company?: string): string {
  return `You are an expert interviewer conducting a realistic job interview for a ${targetRole} position${company ? ` at ${company}` : ''}.

Your role is to:
1. Generate realistic, challenging interview questions appropriate for the role
2. Evaluate candidate answers fairly and constructively
3. Provide specific, actionable feedback to help the candidate improve

Be professional but encouraging. Focus on helping the candidate understand what great answers look like.`;
}
