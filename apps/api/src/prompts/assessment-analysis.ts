import type { AssessmentAnswer } from '@careercompass/types';

export const ASSESSMENT_SYSTEM_PROMPT = `You are a world-class career coach with 20 years of experience helping professionals navigate career transitions and growth. You have deep expertise in talent assessment, job market trends, and skill development.

Your task is to analyze a career assessment and provide deeply personalized, actionable guidance. Be specific, honest, and encouraging. Avoid generic advice.

IMPORTANT: You must respond with valid JSON only. Do not include any text outside the JSON structure.`;

export function buildAssessmentAnalysisPrompt(answers: AssessmentAnswer[]): string {
  const answerMap = Object.fromEntries(answers.map((a) => [a.questionId, a.answer]));

  return `Analyze this career assessment and return a comprehensive career guidance report.

Assessment Answers:
${JSON.stringify(answerMap, null, 2)}

Return a JSON object with this exact structure:
{
  "archetype": {
    "name": "string (2-4 words, e.g. 'The Technical Innovator')",
    "headline": "string (1 sentence capturing their unique career identity)",
    "summary": "string (2-3 paragraphs, deeply personalized to their answers)",
    "keyStrengths": ["string", "string", "string"],
    "idealEnvironment": "string (specific work environment description)",
    "growthAreas": ["string", "string", "string"]
  },
  "jobRecommendations": [
    {
      "title": "string",
      "company": "string (example company where this role exists)",
      "description": "string (role description, 2-3 sentences)",
      "matchScore": number (0-100),
      "salaryMin": number (annual USD),
      "salaryMax": number (annual USD),
      "location": "string (e.g. 'Remote', 'San Francisco, CA')",
      "remote": boolean,
      "whyItFits": "string (specific reasons based on their answers)",
      "growthTrajectory": "string (where this role leads in 2-5 years)",
      "requiredSkills": ["string"],
      "skillGaps": ["string (skills they need to develop)"]
    }
  ],
  "skillGaps": [
    {
      "skillName": "string",
      "category": "string (Technical/Soft Skills/Leadership/Domain Knowledge)",
      "currentLevel": number (0-5),
      "targetLevel": number (0-5),
      "priorityScore": number (1-10),
      "estimatedWeeksToLearn": number,
      "resources": [
        {
          "title": "string",
          "url": "string",
          "platform": "string",
          "type": "course|tutorial|book|video|documentation",
          "isFree": boolean,
          "estimatedHours": number
        }
      ]
    }
  ],
  "topSkillsToLearn": ["string (top 5 skills in priority order)"],
  "estimatedTimeToFirstRole": "string (e.g. '2-3 months with focused effort')"
}

Generate exactly 10 job recommendations sorted by match score descending.
Generate 5-8 skill gaps sorted by priority score descending.
Be specific and tailored to their exact answers — no generic responses.`;
}
