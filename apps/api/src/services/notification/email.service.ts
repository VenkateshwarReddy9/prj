import { Resend } from 'resend';
import { env } from '../../config/env.js';
import { logger } from '../../lib/logger.js';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(params: EmailParams): Promise<void> {
  if (!resend) {
    logger.warn({ to: params.to, subject: params.subject }, 'Resend not configured, skipping email');
    return;
  }
  try {
    const { error } = await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    if (error) {
      logger.error({ error, to: params.to }, 'Failed to send email');
    }
  } catch (err) {
    logger.error({ err, to: params.to }, 'Email send exception');
  }
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  await sendEmail({
    to,
    subject: 'Welcome to CareerCompass 🧭',
    html: `
      <h1>Welcome to CareerCompass, ${name}!</h1>
      <p>We're excited to help you navigate your career journey.</p>
      <p>Start by completing your <a href="${env.FRONTEND_URL}/dashboard/assessment/new">career assessment</a> to get personalized job recommendations, skill roadmaps, and AI coaching.</p>
      <p>— The CareerCompass Team</p>
    `,
  });
}

export async function sendAssessmentCompleteEmail(
  to: string,
  name: string,
  archetype: string
): Promise<void> {
  await sendEmail({
    to,
    subject: 'Your career assessment results are ready!',
    html: `
      <h1>Your results are in, ${name}!</h1>
      <p>Based on your assessment, your career archetype is: <strong>${archetype}</strong></p>
      <p>We've found <strong>10 personalized job recommendations</strong> and a custom skill roadmap just for you.</p>
      <p><a href="${env.FRONTEND_URL}/dashboard/results">View your full results →</a></p>
      <p>— The CareerCompass Team</p>
    `,
  });
}

export async function sendJobMatchEmail(
  to: string,
  name: string,
  jobTitle: string,
  company: string,
  matchScore: number
): Promise<void> {
  await sendEmail({
    to,
    subject: `New job match: ${jobTitle} at ${company}`,
    html: `
      <h1>New job match for you, ${name}!</h1>
      <p>We found a <strong>${matchScore}% match</strong>: ${jobTitle} at ${company}</p>
      <p><a href="${env.FRONTEND_URL}/dashboard/jobs">View all matches →</a></p>
      <p>— The CareerCompass Team</p>
    `,
  });
}
