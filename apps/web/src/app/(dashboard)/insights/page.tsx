'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { TrendingUp, DollarSign, Briefcase, MapPin } from 'lucide-react';

interface SalaryData {
  role: string;
  location: string;
  min: number;
  median: number;
  max: number;
  currency: string;
}

interface TrendDataPoint {
  month: string;
  jobPostings: number;
  avgSalary: number;
  demandIndex: number;
}

interface InsightsData {
  salary: SalaryData;
  trends: TrendDataPoint[];
  topSkills: Array<{ skill: string; demand: number; growth: number }>;
  topLocations: Array<{ city: string; count: number; avgSalary: number }>;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

function formatSalary(n: number) {
  return `$${(n / 1000).toFixed(0)}k`;
}

export default function InsightsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['insights'],
    queryFn: () =>
      apiClient.get<{ data: InsightsData }>('/insights').then((r) => r.data.data),
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-5xl mx-auto text-center py-20">
        <div className="text-4xl mb-4">📈</div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          No insights available yet
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Complete your career assessment to unlock personalized market insights.
        </p>
      </div>
    );
  }

  const { salary, trends, topSkills, topLocations } = data;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Market Insights</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Salary data and market trends for {salary.role}
        </p>
      </div>

      {/* Salary summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Entry Level', value: salary.min, icon: Briefcase, color: 'text-gray-500' },
          { label: 'Median', value: salary.median, icon: DollarSign, color: 'text-blue-600' },
          { label: 'Senior', value: salary.max, icon: TrendingUp, color: 'text-green-600' },
        ].map((item) => (
          <div
            key={item.label}
            className="p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center gap-2 mb-2">
              <item.icon className={`h-4 w-4 ${item.color}`} />
              <span className="text-sm text-gray-500">{item.label}</span>
            </div>
            <div className={`text-2xl font-bold ${item.color}`}>
              {formatSalary(item.value)}
            </div>
            <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {salary.location}
            </div>
          </div>
        ))}
      </div>

      {/* Salary range bar */}
      <div className="p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Salary Range</h2>
        <div className="relative h-10 flex items-center">
          <div className="absolute inset-x-0 h-3 bg-gray-100 dark:bg-gray-800 rounded-full" />
          <div
            className="absolute h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
            style={{
              left: `${((salary.min - salary.min * 0.9) / (salary.max * 1.1 - salary.min * 0.9)) * 100}%`,
              right: `${100 - ((salary.max - salary.min * 0.9) / (salary.max * 1.1 - salary.min * 0.9)) * 100}%`,
            }}
          />
          <div
            className="absolute w-4 h-4 bg-white dark:bg-gray-900 border-2 border-blue-600 rounded-full"
            style={{
              left: `calc(${((salary.median - salary.min * 0.9) / (salary.max * 1.1 - salary.min * 0.9)) * 100}% - 8px)`,
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{formatSalary(salary.min)}</span>
          <span className="text-blue-600 font-medium">Median: {formatSalary(salary.median)}</span>
          <span>{formatSalary(salary.max)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Job postings trend */}
        <div className="p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Job Posting Trend</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="jobPostings"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Demand index */}
        <div className="p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Demand Index</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="demandIndex" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Top skills */}
        <div className="p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Top In-Demand Skills</h2>
          <div className="space-y-3">
            {topSkills.map((skill, i) => (
              <div key={skill.skill}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{skill.skill}</span>
                  <div className="flex items-center gap-2">
                    {skill.growth > 0 && (
                      <span className="text-xs text-green-600">+{skill.growth}%</span>
                    )}
                    <span className="text-xs text-gray-500">{skill.demand}%</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${skill.demand}%`,
                      backgroundColor: COLORS[i % COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top locations */}
        <div className="p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Top Hiring Locations</h2>
          <div className="space-y-3">
            {topLocations.map((loc, i) => (
              <div
                key={loc.city}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{loc.city}</p>
                    <p className="text-xs text-gray-500">{loc.count.toLocaleString()} jobs</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {formatSalary(loc.avgSalary)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
