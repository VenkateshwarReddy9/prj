'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useState } from 'react';
import { toast } from 'sonner';
import { ExternalLink, Plus } from 'lucide-react';
import type { SavedJob } from '@careercompass/types';

type AppStatus = 'SAVED' | 'APPLIED' | 'INTERVIEWING' | 'OFFERED' | 'REJECTED';

const COLUMNS: { id: AppStatus; label: string; color: string; bg: string }[] = [
  { id: 'SAVED', label: 'Saved', color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-800' },
  { id: 'APPLIED', label: 'Applied', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'INTERVIEWING', label: 'Interviewing', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { id: 'OFFERED', label: 'Offered', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
  { id: 'REJECTED', label: 'Rejected', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
];

function JobCard({
  job,
  onMove,
}: {
  job: SavedJob;
  onMove: (id: string, status: AppStatus) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const statuses: AppStatus[] = ['SAVED', 'APPLIED', 'INTERVIEWING', 'OFFERED', 'REJECTED'];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800 group relative">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{job.title}</p>
          <p className="text-xs text-gray-500 truncate mt-0.5">{job.company}</p>
          {job.location && (
            <p className="text-xs text-gray-400 mt-0.5">{job.location}</p>
          )}
          {job.salary && (
            <p className="text-xs text-green-600 font-medium mt-1">{job.salary}</p>
          )}
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {job.url && (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-gray-400 hover:text-blue-500 rounded"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded text-xs"
            >
              ···
            </button>
            {showMenu && (
              <div className="absolute right-0 top-6 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[140px]">
                {statuses
                  .filter((s) => s !== job.status)
                  .map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        onMove(job.id, s);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Move to {s.charAt(0) + s.slice(1).toLowerCase()}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {job.appliedAt && (
        <p className="text-xs text-gray-400 mt-2">
          Applied {new Date(job.appliedAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

export default function JobTrackerPage() {
  const queryClient = useQueryClient();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['saved-jobs'],
    queryFn: () =>
      apiClient.get<{ data: SavedJob[] }>('/jobs/saved').then((r) => r.data.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppStatus }) =>
      apiClient.patch(`/jobs/${id}/status`, { status }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
    },
    onError: () => toast.error('Failed to update status'),
  });

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div key={col.id} className="flex-shrink-0 w-64 space-y-3">
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
            {[1, 2].map((i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  const jobsByStatus = COLUMNS.reduce(
    (acc, col) => ({
      ...acc,
      [col.id]: (jobs ?? []).filter((j) => j.status === col.id),
    }),
    {} as Record<AppStatus, SavedJob[]>
  );

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Job Tracker</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your job applications through each stage.
          </p>
        </div>
        <a
          href="/jobs"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Find Jobs
        </a>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
        {COLUMNS.map((col) => {
          const colJobs = jobsByStatus[col.id] ?? [];
          return (
            <div key={col.id} className="flex-shrink-0 w-72">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className={`font-semibold text-sm ${col.color}`}>{col.label}</h3>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${col.bg} ${col.color} font-medium`}>
                    {colJobs.length}
                  </span>
                </div>
              </div>
              <div className={`rounded-xl p-3 min-h-[400px] space-y-3 ${col.bg}`}>
                {colJobs.length === 0 && (
                  <p className="text-xs text-gray-400 text-center pt-8">No jobs here yet</p>
                )}
                {colJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onMove={(id, status) => updateStatus.mutate({ id, status })}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
