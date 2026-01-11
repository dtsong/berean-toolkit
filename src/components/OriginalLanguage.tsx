/**
 * OriginalLanguage component
 * Displays Greek/Hebrew text with Strong's numbers and definitions
 */

'use client';

import type { OriginalLanguageWord } from '@/types';

interface OriginalLanguageProps {
  words: OriginalLanguageWord[];
  loading?: boolean;
}

export function OriginalLanguage({
  words,
  loading = false,
}: OriginalLanguageProps): React.ReactElement {
  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 rounded bg-zinc-200 dark:bg-zinc-700"></div>
        ))}
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="rounded-lg bg-zinc-100 p-6 text-center text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        Original language data will appear here
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {words.map((word, index) => (
        <div
          key={`${word.strongsNumber}-${index}`}
          className="rounded-lg border border-zinc-200 p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          <div className="mb-2 flex items-baseline gap-3">
            <span className="text-xl font-medium text-zinc-900 dark:text-zinc-100">
              {word.word}
            </span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">{word.transliteration}</span>
            <span className="ml-auto rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              {word.strongsNumber}
            </span>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">{word.definition}</p>
          {word.partOfSpeech != null && (
            <span className="mt-2 inline-block text-xs text-zinc-400 dark:text-zinc-500">
              {word.partOfSpeech}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
