'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ChevronRight, Star, RotateCcw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface InterviewQuestion {
  id: string;
  question: string;
  followUp?: string;
  category: string;
}

interface InterviewAnswer {
  questionId: string;
  answer: string;
  score?: number;
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
}

interface InterviewSession {
  id: string;
  type: string;
  targetRole: string;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  overallScore?: number;
  completedAt: string | null;
  createdAt: string;
}

const INTERVIEW_TYPES = [
  { value: 'BEHAVIORAL', label: 'Behavioral', description: 'Situation-based questions about past experiences', icon: '🧠' },
  { value: 'TECHNICAL', label: 'Technical', description: 'Role-specific technical knowledge questions', icon: '💻' },
  { value: 'CASE', label: 'Case Study', description: 'Problem-solving and analytical scenarios', icon: '📊' },
  { value: 'MIXED', label: 'Mixed', description: 'Combination of all types', icon: '🎯' },
];

export default function InterviewPage() {
  const queryClient = useQueryClient();
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<InterviewAnswer | null>(null);
  const [view, setView] = useState<'list' | 'active' | 'results'>('list');

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['interview-sessions'],
    queryFn: () =>
      apiClient.get<{ data: InterviewSession[] }>('/interviews/sessions').then((r) => r.data.data),
  });

  const startSession = useMutation({
    mutationFn: (data: { type: string; targetRole: string }) =>
      apiClient.post<{ data: InterviewSession }>('/interviews/sessions', data).then((r) => r.data.data),
    onSuccess: (session) => {
      setActiveSession(session);
      setCurrentQuestionIndex(0);
      setAnswer('');
      setCurrentAnswer(null);
      setView('active');
    },
    onError: () => toast.error('Failed to start session'),
  });

  const submitAnswer = async () => {
    if (!activeSession || !answer.trim()) return;
    setIsEvaluating(true);
    try {
      const question = activeSession.questions[currentQuestionIndex];
      const res = await apiClient.post<{ data: InterviewAnswer }>(
        `/interviews/sessions/${activeSession.id}/answers`,
        { questionId: question.id, answer }
      );
      setCurrentAnswer(res.data.data);
    } catch {
      toast.error('Failed to evaluate answer');
    } finally {
      setIsEvaluating(false);
    }
  };

  const nextQuestion = () => {
    if (!activeSession) return;
    if (currentQuestionIndex < activeSession.questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
      setAnswer('');
      setCurrentAnswer(null);
    } else {
      queryClient.invalidateQueries({ queryKey: ['interview-sessions'] });
      setView('results');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        {[1, 2].map((i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (view === 'active' && activeSession) {
    const question = activeSession.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / activeSession.questions.length) * 100;

    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {activeSession.targetRole} — {activeSession.type} Interview
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Question {currentQuestionIndex + 1} of {activeSession.questions.length}
            </p>
          </div>
          <button
            onClick={() => setView('list')}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Exit
          </button>
        </div>

        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full mb-8">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-4">
              <span className="text-xs font-medium px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                {question.category}
              </span>
              <p className="text-lg font-medium text-gray-900 dark:text-white mt-3">
                {question.question}
              </p>
              {question.followUp && (
                <p className="text-sm text-gray-500 mt-2 italic">{question.followUp}</p>
              )}
            </div>

            {!currentAnswer ? (
              <div className="space-y-4">
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  rows={6}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <button
                  onClick={submitAnswer}
                  disabled={!answer.trim() || isEvaluating}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isEvaluating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Evaluating...
                    </>
                  ) : (
                    'Submit Answer'
                  )}
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Feedback</h3>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.round((currentAnswer.score || 0) / 20)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {currentAnswer.score}/100
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{currentAnswer.feedback}</p>
                  {currentAnswer.strengths && currentAnswer.strengths.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">Strengths</p>
                      <ul className="space-y-1">
                        {currentAnswer.strengths.map((s, i) => (
                          <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex gap-2">
                            <span className="text-green-500">✓</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {currentAnswer.improvements && currentAnswer.improvements.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">Areas to improve</p>
                      <ul className="space-y-1">
                        {currentAnswer.improvements.map((s, i) => (
                          <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex gap-2">
                            <span className="text-amber-500">→</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <button
                  onClick={nextQuestion}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  {currentQuestionIndex < activeSession.questions.length - 1 ? (
                    <>Next Question <ChevronRight className="h-4 w-4" /></>
                  ) : (
                    'View Results'
                  )}
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  if (view === 'results' && activeSession) {
    const answeredQuestions = activeSession.questions.map((q, i) => ({
      question: q,
      answer: activeSession.answers[i],
    }));
    const avgScore = answeredQuestions.reduce((sum, qa) => sum + (qa.answer?.score || 0), 0) / answeredQuestions.length;

    return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
            {Math.round(avgScore)}
            <span className="text-2xl text-gray-400">/100</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Overall interview score</p>
          <div className="flex justify-center gap-1 mt-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-6 w-6 ${
                  star <= Math.round(avgScore / 20)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {answeredQuestions.map(({ question, answer: ans }, i) => (
            <div
              key={question.id}
              className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm font-medium text-gray-900 dark:text-white flex-1">
                  {i + 1}. {question.question}
                </p>
                <span className="text-sm font-bold text-blue-600 whitespace-nowrap">
                  {ans?.score ?? '—'}/100
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setView('list')}
            className="flex-1 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Back to Sessions
          </button>
          <button
            onClick={() => {
              setView('active');
              setCurrentQuestionIndex(0);
              setAnswer('');
              setCurrentAnswer(null);
            }}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <RotateCcw className="h-4 w-4" /> Retry Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Interview Practice</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Sharpen your skills with AI-powered mock interviews.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {INTERVIEW_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() =>
              startSession.mutate({ type: type.value, targetRole: 'Software Engineer' })
            }
            disabled={startSession.isPending}
            className="p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 text-left hover:border-blue-300 dark:hover:border-blue-700 transition-colors disabled:opacity-50"
          >
            <div className="text-2xl mb-2">{type.icon}</div>
            <div className="font-medium text-gray-900 dark:text-white">{type.label}</div>
            <div className="text-sm text-gray-500 mt-0.5">{type.description}</div>
          </button>
        ))}
      </div>

      {sessions && sessions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Past Sessions</h2>
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {session.targetRole} — {session.type}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {session.overallScore !== undefined && session.overallScore !== null ? (
                  <span className="text-sm font-bold text-blue-600">{session.overallScore}/100</span>
                ) : (
                  <span className="text-xs text-gray-400">In progress</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
