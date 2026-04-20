export interface AssessmentQuestion {
  id: string;
  step: number;
  title: string;
  description: string;
  type: 'single' | 'multi' | 'scale' | 'text' | 'ranking';
  options?: Array<{ value: string; label: string; description?: string }>;
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  required: boolean;
}

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'interests',
    step: 1,
    title: 'What areas genuinely excite you?',
    description: 'Select all that resonate with you — these shape your career direction.',
    type: 'multi',
    required: true,
    options: [
      { value: 'technology', label: 'Technology & Engineering', description: 'Building products, solving technical problems' },
      { value: 'data', label: 'Data & Analytics', description: 'Working with numbers, finding patterns' },
      { value: 'design', label: 'Design & Creativity', description: 'Visual design, UX, creative work' },
      { value: 'business', label: 'Business & Strategy', description: 'Operations, growth, problem-solving' },
      { value: 'people', label: 'People & Culture', description: 'HR, coaching, organizational development' },
      { value: 'marketing', label: 'Marketing & Communications', description: 'Brand, content, customer acquisition' },
      { value: 'finance', label: 'Finance & Investing', description: 'Financial analysis, investment, accounting' },
      { value: 'research', label: 'Research & Science', description: 'Academic research, scientific inquiry' },
    ],
  },
  {
    id: 'skills',
    step: 2,
    title: "What are your strongest skill areas?",
    description: 'Be honest — this helps us find roles that leverage what you\'re already good at.',
    type: 'multi',
    required: true,
    options: [
      { value: 'coding', label: 'Software Development', description: 'Programming, system design' },
      { value: 'analysis', label: 'Data Analysis', description: 'SQL, Excel, statistical analysis' },
      { value: 'communication', label: 'Communication & Writing', description: 'Presenting, writing, storytelling' },
      { value: 'leadership', label: 'Leadership & Management', description: 'Team management, strategic thinking' },
      { value: 'sales', label: 'Sales & Negotiation', description: 'Closing deals, relationship building' },
      { value: 'design_skills', label: 'Visual & UX Design', description: 'Figma, Adobe, user research' },
      { value: 'project_management', label: 'Project Management', description: 'Planning, execution, stakeholder management' },
      { value: 'customer_success', label: 'Customer Success', description: 'Support, onboarding, retention' },
    ],
  },
  {
    id: 'work_style',
    step: 3,
    title: 'How do you work best?',
    description: 'Understanding your work style helps us match you with the right environment.',
    type: 'multi',
    required: true,
    options: [
      { value: 'independent', label: 'Independent work', description: 'Deep focus, minimal meetings' },
      { value: 'collaborative', label: 'Collaborative work', description: 'Team projects, brainstorming' },
      { value: 'structured', label: 'Structured environment', description: 'Clear processes, defined roles' },
      { value: 'autonomous', label: 'High autonomy', description: 'Figure things out, self-directed' },
      { value: 'fast_paced', label: 'Fast-paced', description: 'Moving quickly, wearing many hats' },
      { value: 'methodical', label: 'Methodical & deliberate', description: 'Careful planning, quality over speed' },
    ],
  },
  {
    id: 'values',
    step: 4,
    title: "What matters most to you in a career?",
    description: 'Rank your top 3 priorities.',
    type: 'ranking',
    required: true,
    options: [
      { value: 'compensation', label: 'High compensation', description: 'Top-of-market salary and equity' },
      { value: 'impact', label: 'Meaningful impact', description: 'Work that makes a real difference' },
      { value: 'balance', label: 'Work-life balance', description: 'Sustainable hours, flexible schedule' },
      { value: 'growth', label: 'Career growth', description: 'Fast progression, learning opportunities' },
      { value: 'stability', label: 'Job stability', description: 'Secure, established organization' },
      { value: 'mission', label: 'Mission-driven', description: 'Aligned with a cause you care about' },
    ],
  },
  {
    id: 'experience',
    step: 5,
    title: 'Tell us about your background',
    description: 'This helps us calibrate recommendations to your actual experience level.',
    type: 'single',
    required: true,
    options: [
      { value: 'student', label: 'Student / Recent Graduate', description: '0-1 years of experience' },
      { value: 'junior', label: 'Early Career', description: '1-3 years of experience' },
      { value: 'mid', label: 'Mid-Level', description: '3-7 years of experience' },
      { value: 'senior', label: 'Senior / Lead', description: '7-12 years of experience' },
      { value: 'executive', label: 'Senior Leader / Executive', description: '12+ years, management experience' },
    ],
  },
  {
    id: 'target_industry',
    step: 6,
    title: 'Which industries interest you?',
    description: 'Select up to 3 industries you want to work in.',
    type: 'multi',
    required: true,
    options: [
      { value: 'tech', label: 'Technology / SaaS' },
      { value: 'fintech', label: 'Fintech / Finance' },
      { value: 'health', label: 'Healthcare / Biotech' },
      { value: 'ecommerce', label: 'E-commerce / Retail' },
      { value: 'media', label: 'Media / Entertainment' },
      { value: 'education', label: 'EdTech / Education' },
      { value: 'gov', label: 'Government / Non-profit' },
      { value: 'consulting', label: 'Consulting / Services' },
    ],
  },
  {
    id: 'company_preference',
    step: 7,
    title: "What's your ideal company type?",
    description: 'Different environments suit different people — be honest.',
    type: 'single',
    required: true,
    options: [
      { value: 'startup_early', label: 'Early-stage Startup (1-50 people)', description: 'High risk, high reward, lots of ownership' },
      { value: 'startup_growth', label: 'Growth Startup (50-500 people)', description: 'Scaling fast, still scrappy' },
      { value: 'mid_market', label: 'Mid-Market (500-5k people)', description: 'Established processes, room to grow' },
      { value: 'enterprise', label: 'Enterprise (5k+ people)', description: 'Resources, stability, structured career paths' },
    ],
  },
  {
    id: 'constraints',
    step: 8,
    title: 'Any constraints we should know about?',
    description: "We'll filter recommendations to match your real-world situation.",
    type: 'multi',
    required: false,
    options: [
      { value: 'remote_only', label: 'Remote only', description: "Can't relocate or commute" },
      { value: 'visa_required', label: 'Need visa sponsorship', description: 'Require employer visa support' },
      { value: 'local_only', label: 'Specific location', description: 'Must stay in current city/country' },
      { value: 'salary_minimum', label: 'Minimum salary requirement', description: 'Have a floor for compensation' },
      { value: 'part_time', label: 'Open to part-time / contract', description: 'Flexible on employment type' },
    ],
  },
];

export const ASSESSMENT_TOTAL_STEPS = ASSESSMENT_QUESTIONS.length;
