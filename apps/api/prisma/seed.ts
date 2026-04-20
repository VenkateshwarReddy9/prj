import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample users
  const user1 = await prisma.user.upsert({
    where: { clerkId: 'seed_user_1' },
    update: {},
    create: {
      clerkId: 'seed_user_1',
      email: 'alice@example.com',
      name: 'Alice Johnson',
      plan: 'PRO',
      onboardingDone: true,
      currentTitle: 'Software Engineer',
      targetRole: 'Senior Software Engineer',
      yearsExp: 4,
      location: 'San Francisco, CA',
      skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS'],
    },
  });

  const user2 = await prisma.user.upsert({
    where: { clerkId: 'seed_user_2' },
    update: {},
    create: {
      clerkId: 'seed_user_2',
      email: 'bob@example.com',
      name: 'Bob Chen',
      plan: 'STARTER',
      onboardingDone: true,
      currentTitle: 'Product Designer',
      targetRole: 'Senior Product Designer',
      yearsExp: 3,
      location: 'New York, NY',
      skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
    },
  });

  // Create assessment for user1
  const assessment1 = await prisma.assessment.create({
    data: {
      userId: user1.id,
      status: 'COMPLETED',
      answers: [
        { questionId: 'interests', answer: ['technology', 'data'] },
        { questionId: 'skills', answer: ['coding', 'analysis'] },
        { questionId: 'work_style', answer: ['independent', 'autonomous'] },
        { questionId: 'values', answer: ['growth', 'compensation', 'impact'] },
        { questionId: 'experience', answer: 'mid' },
        { questionId: 'target_industry', answer: ['tech', 'fintech'] },
        { questionId: 'company_preference', answer: 'startup_growth' },
        { questionId: 'constraints', answer: ['remote_only'] },
      ],
      result: {
        archetype: {
          name: 'The Technical Innovator',
          headline: 'You thrive at the intersection of engineering excellence and product impact',
          summary:
            'You are a technically strong engineer who values autonomy and growth. You prefer working on meaningful problems with high ownership and low bureaucracy.',
          keyStrengths: ['Systems thinking', 'Problem decomposition', 'Technical leadership'],
          idealEnvironment: 'Growth-stage startup where you can shape technical direction',
          growthAreas: ['Stakeholder communication', 'Project estimation', 'Team mentorship'],
        },
        jobRecommendations: [
          {
            title: 'Senior Software Engineer',
            matchScore: 94,
            salaryMin: 150000,
            salaryMax: 200000,
            remote: true,
            whyItFits: 'Matches your technical skills and growth aspirations',
            requiredSkills: ['TypeScript', 'React', 'Node.js', 'System Design'],
          },
        ],
        skillGaps: [
          {
            skillName: 'System Design',
            currentLevel: 3,
            targetLevel: 5,
            priorityScore: 9,
            estimatedWeeksToLearn: 8,
          },
        ],
        topSkillsToLearn: ['System Design', 'Distributed Systems', 'Technical Leadership'],
        estimatedTimeToFirstRole: '2-3 months',
      },
      tokensUsed: 4820,
      processingMs: 8200,
    },
  });

  // Create job recommendations
  await prisma.jobRecommendation.createMany({
    data: [
      {
        assessmentId: assessment1.id,
        title: 'Senior Software Engineer',
        company: 'Stripe',
        matchScore: 94,
        skillGaps: ['Distributed Systems'],
        salaryMin: 160000,
        salaryMax: 210000,
        remote: true,
        location: 'Remote',
        whyItFits: 'Stripe values strong engineers who can work autonomously on complex systems',
      },
      {
        assessmentId: assessment1.id,
        title: 'Staff Engineer',
        company: 'Linear',
        matchScore: 88,
        skillGaps: ['Technical Leadership', 'System Design'],
        salaryMin: 200000,
        salaryMax: 260000,
        remote: true,
        location: 'Remote',
        whyItFits: 'Small, high-impact team with significant engineering ownership',
      },
    ],
  });

  // Create skill roadmap
  const roadmap = await prisma.skillRoadmap.create({
    data: {
      userId: user1.id,
      title: 'Path to Senior Software Engineer',
      targetRole: 'Senior Software Engineer',
      timelineWeeks: 16,
      isActive: true,
    },
  });

  await prisma.roadmapSkill.createMany({
    data: [
      {
        roadmapId: roadmap.id,
        skillName: 'System Design',
        category: 'Technical',
        weekStart: 1,
        weekEnd: 6,
        order: 1,
        resources: [
          {
            title: 'System Design Interview',
            url: 'https://www.systemdesigninterview.com',
            platform: 'Book',
            type: 'book',
            isFree: false,
            estimatedHours: 30,
          },
        ],
      },
      {
        roadmapId: roadmap.id,
        skillName: 'Distributed Systems',
        category: 'Technical',
        weekStart: 4,
        weekEnd: 12,
        order: 2,
        resources: [
          {
            title: 'Designing Data-Intensive Applications',
            url: 'https://dataintensive.net',
            platform: 'Book',
            type: 'book',
            isFree: false,
            estimatedHours: 40,
          },
        ],
      },
    ],
  });

  // Create saved jobs for user1
  await prisma.savedJob.createMany({
    data: [
      {
        userId: user1.id,
        externalId: 'stripe_se_001',
        source: 'manual',
        title: 'Senior Software Engineer',
        company: 'Stripe',
        location: 'Remote',
        salaryMin: 160000,
        salaryMax: 210000,
        url: 'https://stripe.com/jobs',
        status: 'APPLIED',
        appliedAt: new Date('2024-11-15'),
      },
      {
        userId: user1.id,
        externalId: 'vercel_se_001',
        source: 'manual',
        title: 'Senior Engineer',
        company: 'Vercel',
        location: 'Remote',
        salaryMin: 170000,
        salaryMax: 220000,
        url: 'https://vercel.com/careers',
        status: 'SAVED',
      },
    ],
  });

  // Create chat session for user1
  const chatSession = await prisma.chatSession.create({
    data: {
      userId: user1.id,
      title: 'Interview prep for Stripe',
      tokensUsed: 1200,
    },
  });

  await prisma.chatMessage.createMany({
    data: [
      {
        sessionId: chatSession.id,
        role: 'USER',
        content: "I have an interview at Stripe next week for a Senior SWE role. How should I prepare?",
      },
      {
        sessionId: chatSession.id,
        role: 'ASSISTANT',
        content:
          "Great news on the Stripe interview! Here's how I'd approach your preparation...\n\n**1. System Design** — Stripe interviews heavily on distributed systems. Review payment processing, idempotency keys, and event-driven architectures.\n\n**2. Coding** — Practice on LeetCode. Focus on graph problems and dynamic programming.\n\n**3. Behavioral** — Prepare STAR stories around ownership, working with ambiguity, and technical leadership.\n\n**4. Product Knowledge** — Deep dive into Stripe's APIs, their approach to developer experience, and recent product launches.\n\nWould you like me to run a mock technical interview?",
        tokensUsed: 420,
      },
    ],
  });

  // Create user skills
  await prisma.userSkill.createMany({
    data: [
      { userId: user1.id, skillName: 'TypeScript', level: 4, verified: true },
      { userId: user1.id, skillName: 'React', level: 4, verified: true },
      { userId: user1.id, skillName: 'Node.js', level: 3 },
      { userId: user1.id, skillName: 'PostgreSQL', level: 3 },
      { userId: user1.id, skillName: 'System Design', level: 2 },
      { userId: user2.id, skillName: 'Figma', level: 5, verified: true },
      { userId: user2.id, skillName: 'User Research', level: 4 },
    ],
  });

  // Create notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: user1.id,
        type: 'ASSESSMENT_COMPLETE',
        title: 'Your career assessment is ready!',
        body: 'We\'ve analyzed your profile and found 10 matching roles. Check out your results.',
        read: true,
        emailSent: true,
      },
      {
        userId: user1.id,
        type: 'JOB_MATCH',
        title: 'New job match: Staff Engineer at Linear',
        body: '88% match based on your assessment. Remote, $200k-260k.',
        read: false,
        data: { matchScore: 88, company: 'Linear' },
      },
    ],
  });

  console.log('Seeding complete!');
  console.log(`Created users: ${user1.email}, ${user2.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
