/**
 * VerseDisplay component
 * Shows verse text in user's preferred translation
 */

'use client';

import type { VerseData } from '@/types';

interface VerseDisplayProps {
  verse: VerseData | null;
  loading?: boolean;
  error?: string | null;
}

export function VerseDisplay({
  verse,
  loading = false,
  error = null,
}: VerseDisplayProps): React.ReactElement {
  if (loading) {
    return (
      <div className="animate-pulse rounded-lg bg-zinc-100 p-6 dark:bg-zinc-800">
        <div className="mb-2 h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-700"></div>
        <div className="h-20 rounded bg-zinc-200 dark:bg-zinc-700"></div>
      </div>
    );
  }

  if (error != null) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
        <p className="text-red-700 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (verse == null) {
    return (
      <div className="rounded-lg bg-zinc-100 p-6 text-center text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        Enter a verse reference to begin studying
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-zinc-50 p-6 dark:bg-zinc-800">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {verse.reference.book} {verse.reference.chapter}:{verse.reference.startVerse}
          {verse.reference.endVerse != null ? `-${verse.reference.endVerse}` : ''}
        </span>
        <span className="rounded bg-zinc-200 px-2 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
          {verse.translation}
        </span>
      </div>
      <p className="text-lg leading-relaxed text-zinc-900 dark:text-zinc-100">{verse.text}</p>
    </div>
  );
}
