'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Search, SlidersHorizontal, Bookmark } from 'lucide-react';
import { formatSalaryRange } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';
import type { JobSearchResult } from '@careercompass/types';

export default function JobsPage() {
  const [query, setQuery] = useState('');
  const [remote, setRemote] = useState(false);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['jobs', search, remote],
    queryFn: () =>
      apiClient
        .get<{ data: JobSearchResult[] }>('/jobs/search', { params: { query: search, remote } })
        .then((r) => r.data.data),
    enabled: true,
  });

  const saveJob = async (job: JobSearchResult) => {
    try {
      await apiClient.post('/jobs/save', {
        externalId: job.externalId,
        source: job.source,
        title: job.title,
        company: job.company,
        location: job.location,
        url: job.url,
        description: job.description,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        remote: job.remote,
      });
      toast.success('Job saved!');
    } catch {
      toast.error('Failed to save job');
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Job Board</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            AI-matched opportunities from top job boards.
          </p>
        </div>
        <Link
          href="/dashboard/jobs/tracker"
          className="text-sm text-blue-600 hover:underline"
        >
          View Saved Jobs →
        </Link>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setSearch(query)}
            placeholder="Search job title, company, or skill..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => setSearch(query)}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Search
        </button>
        <button
          onClick={() => setRemote((r) => !r)}
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${
            remote
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Remote
        </button>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {data?.map((job) => (
            <div
              key={`${job.source}-${job.externalId}`}
              className="p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                    {job.remote && (
                      <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                        Remote
                      </span>
                    )}
                    {job.matchScore != null && (
                      <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                        {Math.round(job.matchScore)}% match
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {job.company} · {job.location}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatSalaryRange(job.salaryMin, job.salaryMax)}
                  </p>
                  {job.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                      {job.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => saveJob(job)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Save job"
                  >
                    <Bookmark className="h-5 w-5" />
                  </button>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Apply
                  </a>
                </div>
              </div>
            </div>
          ))}
          {data?.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No jobs found. Try a different search query.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
