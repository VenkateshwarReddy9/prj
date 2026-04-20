'use client';

import { formatSalaryRange } from '@/lib/utils';
import type { Assessment, AssessmentResult } from '@careercompass/types';
import { Briefcase, TrendingUp, Star } from 'lucide-react';

interface Props {
  assessment: Assessment;
}

export function AssessmentResults({ assessment }: Props) {
  const result = assessment.result as AssessmentResult | null;
  if (!result) return null;

  const { archetype, jobRecommendations, skillGaps } = result;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Archetype card */}
      <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl text-white">
        <div className="text-sm font-medium opacity-80 mb-1">Your Career Archetype</div>
        <h1 className="text-3xl font-extrabold mb-2">{archetype.name}</h1>
        <p className="text-lg opacity-90 mb-4">{archetype.headline}</p>
        <p className="opacity-80 leading-relaxed">{archetype.summary}</p>

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {archetype.keyStrengths.map((strength, i) => (
            <div key={i} className="flex items-start gap-2">
              <Star className="h-4 w-4 opacity-70 flex-shrink-0 mt-0.5" />
              <span className="text-sm opacity-90">{strength}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Job recommendations */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-blue-600" />
          Top Job Matches ({jobRecommendations.length})
        </h2>
        <div className="space-y-4">
          {jobRecommendations.map((job, i) => (
            <div
              key={i}
              className="p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                    <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                      {Math.round(job.matchScore)}% match
                    </span>
                    {job.remote && (
                      <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                        Remote
                      </span>
                    )}
                  </div>
                  {job.company && (
                    <p className="text-sm text-gray-500 mt-1">
                      {job.company} · {job.location ?? 'Location varies'}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">{formatSalaryRange(job.salaryMin, job.salaryMax)}</p>
                  {job.whyItFits && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{job.whyItFits}</p>
                  )}
                </div>
              </div>
              {job.skillGaps.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.skillGaps.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 text-xs bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-full"
                    >
                      Learn: {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Skill gaps */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Skills to Develop
        </h2>
        <div className="space-y-4">
          {skillGaps.slice(0, 5).map((gap, i) => (
            <div
              key={i}
              className="p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">{gap.skillName}</span>
                  <span className="text-sm text-gray-500 ml-2">{gap.category}</span>
                </div>
                <span className="text-sm text-gray-500">{gap.estimatedWeeksToLearn} weeks</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-16">Current: {gap.currentLevel}/5</span>
                <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${(gap.currentLevel / 5) * 100}%` }}
                  />
                </div>
                <div
                  className="h-full bg-orange-400 rounded-full"
                  style={{ width: `${(gap.targetLevel / 5) * 100}%` }}
                />
                <span className="text-xs text-gray-500 w-16">Target: {gap.targetLevel}/5</span>
              </div>
              {gap.resources.slice(0, 2).map((r, j) => (
                <a
                  key={j}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-2 text-sm text-blue-600 hover:underline truncate"
                >
                  📚 {r.title} ({r.platform})
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
