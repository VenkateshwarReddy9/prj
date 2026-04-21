'use client';

import { FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Resume } from '@careercompass/types';
import Link from 'next/link';

interface Props {
  resume: Resume;
  onUpdate: () => void;
}

export function ResumeCard({ resume, onUpdate: _onUpdate }: Props) {
  const score = resume.atsScore;
  const scoreColor =
    score == null ? 'text-gray-400' :
    score >= 80 ? 'text-green-600' :
    score >= 60 ? 'text-yellow-600' :
    'text-red-600';

  return (
    <div className="p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-blue-600" />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{resume.filename}</p>
            <p className="text-xs text-gray-500">
              {new Date(resume.createdAt).toLocaleDateString()}
              {resume.isActive && (
                <span className="ml-2 text-green-600 font-medium">Active</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {score == null ? (
            <div className="flex items-center gap-1.5 text-gray-400 text-sm">
              <Clock className="h-4 w-4 animate-spin" />
              Analyzing...
            </div>
          ) : (
            <div className="text-center">
              <div className={cn('text-2xl font-extrabold', scoreColor)}>{score}</div>
              <div className="text-xs text-gray-500">ATS Score</div>
            </div>
          )}

          <Link
            href={`/dashboard/resume/${resume.id}`}
            className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>

      {resume.atsIssues && resume.atsIssues.length > 0 && (
        <div className="mt-4 flex gap-3">
          {resume.atsIssues.filter((i) => i.severity === 'critical').length > 0 && (
            <span className="flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="h-3.5 w-3.5" />
              {resume.atsIssues.filter((i) => i.severity === 'critical').length} critical issues
            </span>
          )}
          {resume.atsIssues.filter((i) => i.severity === 'warning').length > 0 && (
            <span className="flex items-center gap-1 text-xs text-yellow-600">
              <AlertCircle className="h-3.5 w-3.5" />
              {resume.atsIssues.filter((i) => i.severity === 'warning').length} warnings
            </span>
          )}
          {resume.atsScore != null && resume.atsScore >= 80 && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle className="h-3.5 w-3.5" />
              Good ATS compatibility
            </span>
          )}
        </div>
      )}
    </div>
  );
}
