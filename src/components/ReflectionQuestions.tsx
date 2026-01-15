/**
 * ReflectionQuestions component
 * Displays AI-generated reflection questions grouped by category
 * (observation, interpretation, application)
 */

'use client';

import type { ReflectionQuestion } from '@/types';

interface ReflectionQuestionsProps {
  questions: ReflectionQuestion[] | null;
  loading?: boolean;
  answers: Record<number, string>;
  onAnswerChange: (index: number, answer: string) => void;
}

const CATEGORY_CONFIG = {
  observation: {
    label: 'Observation',
    description: 'What does the text say?',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-700 dark:text-blue-300',
    headerBg: 'bg-blue-100 dark:bg-blue-900/40',
  },
  interpretation: {
    label: 'Interpretation',
    description: 'What does it mean?',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    textColor: 'text-amber-700 dark:text-amber-300',
    headerBg: 'bg-amber-100 dark:bg-amber-900/40',
  },
  application: {
    label: 'Application',
    description: 'How can I apply this?',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    textColor: 'text-green-700 dark:text-green-300',
    headerBg: 'bg-green-100 dark:bg-green-900/40',
  },
} as const;

type CategoryKey = keyof typeof CATEGORY_CONFIG;

export function ReflectionQuestions({
  questions,
  loading = false,
  answers,
  onAnswerChange,
}: ReflectionQuestionsProps): React.ReactElement {
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-40 rounded bg-zinc-200 dark:bg-zinc-700"></div>
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="space-y-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
          >
            <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-700"></div>
            <div className="h-5 w-full rounded bg-zinc-200 dark:bg-zinc-700"></div>
            <div className="h-20 w-full rounded bg-zinc-200 dark:bg-zinc-700"></div>
          </div>
        ))}
      </div>
    );
  }

  if (questions == null || questions.length === 0) {
    return (
      <div className="rounded-lg bg-zinc-100 p-6 text-center text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        Click &quot;Generate Questions&quot; to create reflection questions for this passage
      </div>
    );
  }

  // Group questions by category
  const grouped = questions.reduce(
    (acc, question, index) => {
      const category = question.category as CategoryKey;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({ ...question, originalIndex: index });
      return acc;
    },
    {} as Record<CategoryKey, Array<ReflectionQuestion & { originalIndex: number }>>
  );

  // Display categories in order: observation, interpretation, application
  const categoryOrder: CategoryKey[] = ['observation', 'interpretation', 'application'];

  return (
    <div className="space-y-6">
      {categoryOrder.map(category => {
        const categoryQuestions = grouped[category];
        if (!categoryQuestions || categoryQuestions.length === 0) return null;

        const config = CATEGORY_CONFIG[category];

        return (
          <div
            key={category}
            className={`rounded-lg border ${config.borderColor} ${config.bgColor} overflow-hidden`}
          >
            {/* Category Header */}
            <div className={`px-4 py-2 ${config.headerBg}`}>
              <h4 className={`text-sm font-semibold uppercase tracking-wide ${config.textColor}`}>
                {config.label}
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{config.description}</p>
            </div>

            {/* Questions in this category */}
            <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {categoryQuestions.map((q, idx) => (
                <div key={idx} className="p-4">
                  <p className="mb-2 font-medium text-zinc-900 dark:text-zinc-100">{q.question}</p>
                  <textarea
                    value={answers[q.originalIndex] ?? ''}
                    onChange={e => onAnswerChange(q.originalIndex, e.target.value)}
                    placeholder="Write your reflection..."
                    rows={3}
                    className="w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
