'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ResumeUpload } from '@/components/resume/ResumeUpload';
import { ResumeCard } from '@/components/resume/ResumeCard';
import { FileText, Upload } from 'lucide-react';
import { useState } from 'react';
import type { Resume } from '@careercompass/types';

export default function ResumePage() {
  const [showUpload, setShowUpload] = useState(false);

  const { data: resumes, refetch } = useQuery({
    queryKey: ['resumes'],
    queryFn: () =>
      apiClient.get<{ data: Resume[] }>('/resumes').then((r) => r.data.data),
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resume Manager</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Upload, analyze, and optimize your resume for ATS systems.
          </p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Upload className="h-4 w-4" />
          Upload Resume
        </button>
      </div>

      {showUpload && (
        <div className="mb-6">
          <ResumeUpload
            onSuccess={() => {
              setShowUpload(false);
              refetch();
            }}
            onCancel={() => setShowUpload(false)}
          />
        </div>
      )}

      {!resumes?.length && !showUpload ? (
        <div className="text-center py-20">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No resumes yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Upload your PDF resume to get an ATS score and AI-powered optimization suggestions.
          </p>
          <button
            onClick={() => setShowUpload(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Upload Your First Resume
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {resumes?.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} onUpdate={refetch} />
          ))}
        </div>
      )}
    </div>
  );
}
