'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/components/providers/SocketProvider';
import { motion } from 'framer-motion';

interface Props {
  jobId: string;
  assessmentId: string;
}

interface ProgressEvent {
  step: number;
  total: number;
  message: string;
}

export function AssessmentProgress({ jobId, assessmentId }: Props) {
  const router = useRouter();
  const socket = useSocket();
  const [progress, setProgress] = useState<ProgressEvent>({ step: 0, total: 5, message: 'Starting analysis...' });
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.emit('subscribe:assessment', jobId);

    const handleProgress = (data: { jobId: string; step: number; total: number; message: string }) => {
      if (data.jobId === jobId) {
        setProgress({ step: data.step, total: data.total, message: data.message });
      }
    };

    const handleComplete = (data: { jobId: string; assessmentId: string }) => {
      if (data.jobId === jobId) {
        setIsDone(true);
        setTimeout(() => {
          router.push(`/dashboard/assessment/${data.assessmentId}`);
        }, 1500);
      }
    };

    socket.on('assessment:progress', handleProgress);
    socket.on('assessment:complete', handleComplete);

    return () => {
      socket.off('assessment:progress', handleProgress);
      socket.off('assessment:complete', handleComplete);
    };
  }, [socket, jobId, assessmentId, router]);

  const percentage = progress.total > 0 ? Math.round((progress.step / progress.total) * 100) : 0;

  return (
    <div className="text-center py-16 max-w-md mx-auto">
      <div className="text-5xl mb-6">🧭</div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {isDone ? 'Analysis Complete!' : 'Analyzing Your Profile'}
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        {isDone ? 'Redirecting to your results...' : progress.message}
      </p>

      <div className="relative h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-4">
        <motion.div
          className="absolute inset-y-0 left-0 bg-blue-600 rounded-full"
          animate={{ width: `${isDone ? 100 : percentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <p className="text-sm text-gray-500">
        Step {progress.step} of {progress.total}
      </p>

      {!isDone && (
        <p className="text-xs text-gray-400 mt-4">
          This usually takes 10-20 seconds. Don't close this tab.
        </p>
      )}
    </div>
  );
}
