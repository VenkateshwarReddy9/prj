'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { AssessmentResults } from '@/components/assessment/AssessmentResults';
import { AssessmentProcessing } from '@/components/assessment/AssessmentProcessing';
import type { Assessment } from '@careercompass/types';

export default function AssessmentResultsPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['assessment', id],
    queryFn: () => apiClient.get<{ data: Assessment }>(`/assessments/${id}`).then((r) => r.data.data),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'PENDING' || status === 'PROCESSING' ? 3000 : false;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading assessment...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load assessment. Please try again.</p>
      </div>
    );
  }

  if (data.status === 'PENDING' || data.status === 'PROCESSING') {
    return <AssessmentProcessing assessment={data} />;
  }

  if (data.status === 'FAILED') {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Assessment processing failed. Please try again.</p>
        <p className="text-gray-500 text-sm mt-2">{data.errorMsg}</p>
      </div>
    );
  }

  return <AssessmentResults assessment={data} />;
}
