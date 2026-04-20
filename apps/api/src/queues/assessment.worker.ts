import { Worker, type Job } from 'bullmq';
import { getRedisConnection } from '../config/redis.js';
import { prisma } from '../config/prisma.js';
import { generateAssessmentResults } from '../services/ai/assessment.ai.js';
import { createNotification } from '../services/notification/notification.service.js';
import { sendAssessmentCompleteEmail } from '../services/notification/email.service.js';
import { logger } from '../lib/logger.js';
import { QUEUE_NAMES } from '@careercompass/constants';
import type { AssessmentJobData } from './index.js';
import type { AssessmentAnswer } from '@careercompass/types';

const PROGRESS_STEPS = [
  { step: 1, message: 'Analyzing your background and goals...' },
  { step: 2, message: 'Identifying your career archetype...' },
  { step: 3, message: 'Finding your best-fit roles...' },
  { step: 4, message: 'Building your skill roadmap...' },
  { step: 5, message: 'Finalizing your personalized results...' },
];

function getIO() {
  // Lazy import to avoid circular dependency
  return import('../socket/index.js').then((m) => m.getIO());
}

async function processAssessment(job: Job<AssessmentJobData>) {
  const { assessmentId, userId, answers } = job.data;
  const startTime = Date.now();

  logger.info({ assessmentId, userId, jobId: job.id }, 'Starting assessment processing');

  try {
    await prisma.assessment.update({
      where: { id: assessmentId },
      data: { status: 'PROCESSING', jobId: job.id },
    });

    // Emit progress to subscribed clients
    const emitProgress = async (stepIndex: number) => {
      const stepData = PROGRESS_STEPS[stepIndex];
      if (!stepData) return;
      try {
        const io = await getIO();
        io.to(`assessment:${job.id}`).emit('assessment:progress', {
          jobId: job.id ?? '',
          step: stepData.step,
          total: PROGRESS_STEPS.length,
          message: stepData.message,
        });
      } catch {
        // Socket.IO might not be available in test environments
      }
    };

    await emitProgress(0);
    const result = await generateAssessmentResults(
      assessmentId,
      userId,
      answers as AssessmentAnswer[]
    );

    await emitProgress(1);
    // Store job recommendations
    if (result.jobRecommendations.length > 0) {
      await prisma.jobRecommendation.createMany({
        data: result.jobRecommendations.map((rec) => ({
          assessmentId,
          title: rec.title,
          company: rec.company ?? null,
          description: rec.description ?? null,
          matchScore: rec.matchScore,
          skillGaps: rec.skillGaps ?? [],
          salaryMin: rec.salaryMin ?? null,
          salaryMax: rec.salaryMax ?? null,
          location: rec.location ?? null,
          remote: rec.remote ?? false,
          whyItFits: rec.whyItFits ?? null,
        })),
      });
    }

    await emitProgress(2);

    // Create skill roadmap
    if (result.skillGaps.length > 0) {
      const roadmap = await prisma.skillRoadmap.create({
        data: {
          userId,
          title: `Career Roadmap — ${result.archetype.name}`,
          targetRole: result.jobRecommendations[0]?.title ?? 'Target Role',
          timelineWeeks: result.skillGaps.reduce((sum, g) => sum + g.estimatedWeeksToLearn, 0),
          isActive: true,
        },
      });

      await prisma.roadmapSkill.createMany({
        data: result.skillGaps.map((gap, i) => ({
          roadmapId: roadmap.id,
          skillName: gap.skillName,
          category: gap.category,
          weekStart: i * 4 + 1,
          weekEnd: i * 4 + gap.estimatedWeeksToLearn,
          order: i + 1,
          resources: gap.resources ?? [],
        })),
      });
    }

    await emitProgress(3);

    const processingMs = Date.now() - startTime;
    await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        status: 'COMPLETED',
        result: result as object,
        processingMs,
      },
    });

    await emitProgress(4);

    // Emit completion event
    try {
      const io = await getIO();
      io.to(`assessment:${job.id}`).emit('assessment:complete', {
        jobId: job.id ?? '',
        assessmentId,
      });
    } catch {
      // Non-critical
    }

    // Send notification and email
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await createNotification({
        userId,
        type: 'ASSESSMENT_COMPLETE',
        title: 'Your career assessment is ready!',
        body: `Your career archetype is "${result.archetype.name}". We found ${result.jobRecommendations.length} matching roles.`,
        data: { assessmentId, archetype: result.archetype.name },
      });

      await sendAssessmentCompleteEmail(user.email, user.name ?? 'there', result.archetype.name);
    }

    logger.info({ assessmentId, processingMs }, 'Assessment processing complete');
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    logger.error({ err, assessmentId }, 'Assessment processing failed');

    await prisma.assessment.update({
      where: { id: assessmentId },
      data: { status: 'FAILED', errorMsg },
    });

    try {
      const io = await getIO();
      io.to(`assessment:${job.id}`).emit('assessment:error', {
        jobId: job.id ?? '',
        error: errorMsg,
      });
    } catch {
      // Non-critical
    }

    throw err;
  }
}

export function createAssessmentWorker() {
  return new Worker<AssessmentJobData>(QUEUE_NAMES.AI_ASSESSMENT, processAssessment, {
    connection: getRedisConnection(),
    concurrency: 3,
  });
}
