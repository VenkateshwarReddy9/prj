export const RESUME_ATS_SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) consultant and executive resume writer with 15 years of experience. You understand exactly how ATS systems parse resumes and what hiring managers look for.

IMPORTANT: Respond with valid JSON only.`;

export function buildResumeATSPrompt(
  resumeText: string,
  targetRole?: string,
  targetJobDescription?: string
): string {
  return `Analyze this resume for ATS compatibility and provide detailed scoring and feedback.

Resume Text:
"""
${resumeText.slice(0, 8000)}
"""

${targetRole ? `Target Role: ${targetRole}` : ''}
${targetJobDescription ? `Target Job Description:\n${targetJobDescription.slice(0, 2000)}` : ''}

Return a JSON object with this structure:
{
  "atsScore": number (0-100 overall ATS compatibility score),
  "categoryScores": {
    "formatting": number (0-100, clean parsing, no tables/columns),
    "keywords": number (0-100, relevant keywords present),
    "content": number (0-100, impact statements, quantification),
    "structure": number (0-100, standard sections present),
    "readability": number (0-100, clear hierarchy and flow)
  },
  "parsedData": {
    "name": "string|null",
    "email": "string|null",
    "phone": "string|null",
    "location": "string|null",
    "linkedin": "string|null",
    "summary": "string|null",
    "experience": [
      {
        "title": "string",
        "company": "string",
        "startDate": "string",
        "endDate": "string|null",
        "current": boolean,
        "bullets": ["string"]
      }
    ],
    "education": [
      {
        "degree": "string",
        "institution": "string",
        "year": "string",
        "gpa": "string|null"
      }
    ],
    "skills": ["string"],
    "certifications": ["string"]
  },
  "issues": [
    {
      "category": "formatting|keywords|content|structure|quantification",
      "severity": "critical|warning|suggestion",
      "section": "string (which section has the issue)",
      "issue": "string (what is wrong)",
      "suggestion": "string (specific actionable fix)"
    }
  ],
  "missingKeywords": ["string (important keywords for the target role that are missing)"],
  "topStrengths": ["string (3-5 things the resume does well)"]
}

Provide at least 8-15 specific, actionable issues. Be honest and direct.`;
}
