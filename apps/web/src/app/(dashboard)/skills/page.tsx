'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import { toast } from 'sonner';

// Using the types structure from the backend
interface RoadmapWithSkills {
  id: string;
  title: string;
  targetRole: string;
  timelineWeeks: number;
  skills: Array<{
    id: string;
    skillName: string;
    category: string;
    weekStart: number;
    weekEnd: number;
    completedAt: string | null;
    order: number;
    resources: Array<{ title: string; url: string; platform: string; type: string }>;
  }>;
}

export default function SkillsPage() {
  const queryClient = useQueryClient();

  const { data: roadmap, isLoading } = useQuery({
    queryKey: ['roadmap'],
    queryFn: () =>
      apiClient.get<{ data: RoadmapWithSkills | null }>('/roadmap').then((r) => r.data.data),
  });

  const toggleComplete = useMutation({
    mutationFn: (skillId: string) =>
      apiClient.patch(`/roadmap/skills/${skillId}/complete`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap'] });
      toast.success('Progress updated!');
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <div className="text-4xl mb-4">📊</div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          No skill roadmap yet
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Complete your career assessment to get a personalized skill roadmap.
        </p>
      </div>
    );
  }

  const completedCount = roadmap.skills.filter((s) => s.completedAt).length;
  const totalCount = roadmap.skills.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{roadmap.title}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Target: {roadmap.targetRole} · {roadmap.timelineWeeks} weeks
        </p>
      </div>

      {/* Overall progress */}
      <div className="p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-gray-900 dark:text-white">Overall Progress</span>
          <span className="text-sm text-gray-500">
            {completedCount}/{totalCount} skills
          </span>
        </div>
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">{progressPercent}% complete</p>
      </div>

      {/* Skills timeline */}
      <div className="space-y-4">
        {roadmap.skills.map((skill) => {
          const isComplete = !!skill.completedAt;
          return (
            <div
              key={skill.id}
              className="p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleComplete.mutate(skill.id)}
                  className="flex-shrink-0 mt-0.5"
                >
                  {isComplete ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <Circle className="h-6 w-6 text-gray-300 hover:text-blue-500 transition-colors" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-medium ${
                        isComplete
                          ? 'line-through text-gray-400'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {skill.skillName}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                      {skill.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <Clock className="h-3.5 w-3.5" />
                    Weeks {skill.weekStart}–{skill.weekEnd}
                    {isComplete && (
                      <span className="text-green-600">
                        · Completed {new Date(skill.completedAt!).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {skill.resources.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {skill.resources.slice(0, 2).map((r, j) => (
                        <a
                          key={j}
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          📚 {r.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
