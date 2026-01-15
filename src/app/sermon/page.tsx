'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SermonOutline } from '@/components/SermonOutline';
import { ReflectionQuestions } from '@/components/ReflectionQuestions';
import type { SermonOutline as SermonOutlineType, ReflectionQuestion } from '@/types';

export default function SermonCompanionPage(): React.ReactElement {
  const [passage, setPassage] = useState('');
  const [title, setTitle] = useState('');
  const [outline, setOutline] = useState<SermonOutlineType | null>(null);
  const [loading, setLoading] = useState(false);

  // Reflection questions state
  const [reflectionQuestions, setReflectionQuestions] = useState<ReflectionQuestion[] | null>(null);
  const [reflectionLoading, setReflectionLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const generateOutline = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch('/api/sermon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passage, title: title.trim() !== '' ? title : undefined }),
      });

      if (response.ok) {
        const data = (await response.json()) as SermonOutlineType;
        setOutline(data);
      }
    } catch {
      console.error('Failed to generate outline');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = (e: React.FormEvent): void => {
    e.preventDefault();
    if (passage.trim() === '') return;
    // Reset reflection questions when generating new outline
    setReflectionQuestions(null);
    setAnswers({});
    void generateOutline();
  };

  const generateQuestions = async (): Promise<void> => {
    setReflectionLoading(true);
    try {
      const response = await fetch('/api/reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passage }),
      });

      if (response.ok) {
        const data = (await response.json()) as { questions: ReflectionQuestion[] };
        setReflectionQuestions(data.questions);
      }
    } catch {
      console.error('Failed to generate reflection questions');
    } finally {
      setReflectionLoading(false);
    }
  };

  const handleAnswerChange = (index: number, answer: string): void => {
    setAnswers(prev => ({ ...prev, [index]: answer }));
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div>
            <Link
              href="/"
              className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
            >
              ← Back to Home
            </Link>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Sermon Companion</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Input Form */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Sermon Details
            </h2>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label
                  htmlFor="passage"
                  className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Passage Reference *
                </label>
                <input
                  id="passage"
                  type="text"
                  value={passage}
                  onChange={e => setPassage(e.target.value)}
                  placeholder="e.g., Romans 8:28-39"
                  className="w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="title"
                  className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Sermon Title (optional)
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g., God's Unfailing Love"
                  className="w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-purple-600 px-6 py-2 font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Outline'}
              </button>
            </form>

            {/* Tips */}
            <div className="mt-6 rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
              <h3 className="mb-2 font-medium text-purple-900 dark:text-purple-100">
                Tips for Use
              </h3>
              <ul className="space-y-1 text-sm text-purple-800 dark:text-purple-200">
                <li>• Enter the passage before the sermon to prepare</li>
                <li>• The outline is suggested — the actual sermon may differ</li>
                <li>• Use the outline as a starting point for notes</li>
              </ul>
            </div>
          </div>

          {/* Outline Display */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Suggested Outline
            </h2>
            <SermonOutline outline={outline} loading={loading} />
          </div>
        </div>

        {/* Reflection Questions Section - shows after outline is generated */}
        {outline != null && (
          <div className="mt-8 border-t border-zinc-200 pt-8 dark:border-zinc-800">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Reflection Questions
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Deepen your understanding with guided questions
                </p>
              </div>
              {reflectionQuestions == null && !reflectionLoading && (
                <button
                  type="button"
                  onClick={() => void generateQuestions()}
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
                >
                  Generate Questions
                </button>
              )}
            </div>
            <ReflectionQuestions
              questions={reflectionQuestions}
              loading={reflectionLoading}
              answers={answers}
              onAnswerChange={handleAnswerChange}
            />
          </div>
        )}
      </main>
    </div>
  );
}
