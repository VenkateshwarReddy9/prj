'use client';

import { cn } from '@/lib/utils';
import type { AssessmentQuestion } from '@careercompass/constants';

interface Props {
  question: AssessmentQuestion;
  currentAnswer: string | string[] | undefined;
  onAnswer: (answer: string | string[]) => void;
}

export function QuestionStep({ question, currentAnswer, onAnswer }: Props) {
  const selectedValues = Array.isArray(currentAnswer)
    ? currentAnswer
    : currentAnswer
    ? [currentAnswer]
    : [];

  const toggleOption = (value: string) => {
    if (question.type === 'single') {
      onAnswer(value);
      return;
    }
    if (selectedValues.includes(value)) {
      onAnswer(selectedValues.filter((v) => v !== value));
    } else {
      onAnswer([...selectedValues, value]);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{question.title}</h2>
      {question.description && (
        <p className="text-gray-600 dark:text-gray-400 mb-6">{question.description}</p>
      )}

      {question.type === 'text' ? (
        <textarea
          value={(currentAnswer as string) ?? ''}
          onChange={(e) => onAnswer(e.target.value)}
          placeholder="Type your answer..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
        />
      ) : (
        <div className="grid gap-3">
          {question.options?.map((option) => {
            const isSelected = selectedValues.includes(option.value);
            return (
              <button
                key={option.value}
                onClick={() => toggleOption(option.value)}
                className={cn(
                  'text-left px-4 py-3 rounded-xl border-2 transition-all',
                  isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center',
                      isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    )}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <div>
                    <span className="font-medium">{option.label}</span>
                    {option.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {option.description}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {question.type === 'multi' && (
        <p className="text-sm text-gray-500 mt-3">Select all that apply</p>
      )}
    </div>
  );
}
