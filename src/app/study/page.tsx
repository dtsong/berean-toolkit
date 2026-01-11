'use client';

import { useState } from 'react';
import Link from 'next/link';
import { VerseDisplay } from '@/components/VerseDisplay';
import { OriginalLanguage } from '@/components/OriginalLanguage';
import { useVerse } from '@/hooks/useVerse';
import type { Translation, OriginalLanguageWord } from '@/types';

export default function StudyPage(): React.ReactElement {
  const [reference, setReference] = useState('');
  const [translation, setTranslation] = useState<Translation>('ESV');
  const { verse, loading, error, fetchVerse } = useVerse();

  // Placeholder - will be populated from BSB data
  const [originalWords] = useState<OriginalLanguageWord[]>([]);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (reference.trim() !== '') {
      void fetchVerse(reference, translation);
    }
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
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Scripture Deep Dive
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Search Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={reference}
              onChange={e => setReference(e.target.value)}
              placeholder="Enter verse reference (e.g., John 3:16)"
              className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
            <select
              value={translation}
              onChange={e => setTranslation(e.target.value as Translation)}
              className="rounded-lg border border-zinc-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              <option value="ESV">ESV</option>
              <option value="NIV">NIV</option>
              <option value="KJV">KJV</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Results */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Verse Display */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Verse Text
            </h2>
            <VerseDisplay verse={verse} loading={loading} error={error} />
          </div>

          {/* Original Language */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Original Language
            </h2>
            <OriginalLanguage words={originalWords} loading={loading} />
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Coming Soon:</strong> Greek/Hebrew word-level tagging powered by the Berean
            Standard Bible, Strong&apos;s definitions, and AI-generated theological insights.
          </p>
        </div>
      </main>
    </div>
  );
}
