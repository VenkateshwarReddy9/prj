'use client';

import { AssessmentProgress } from './AssessmentProgress';
import type { Assessment } from '@careercompass/types';

interface Props {
  assessment: Assessment;
}

export function AssessmentProcessing({ assessment }: Props) {
  return (
    <AssessmentProgress
      jobId={assessment.jobId ?? assessment.id}
      assessmentId={assessment.id}
    />
  );
}
