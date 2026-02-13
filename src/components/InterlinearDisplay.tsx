'use client';

import type { InterlinearVerse, InterlinearWord } from '@/types';

interface InterlinearDisplayProps {
  verses: InterlinearVerse[];
  loading?: boolean;
  error?: string | null;
  onWordClick?: (word: InterlinearWord) => void;
}

function InterlinearWordCard({
  word,
  onClick,
}: {
  word: InterlinearWord;
  onClick?: (word: InterlinearWord) => void;
}): React.ReactElement {
  const hasStrongs = word.strongsNumber && word.strongsNumber !== '';

  return (
    <button
      onClick={() => onClick?.(word)}
      disabled={!hasStrongs}
      className={`flex flex-col items-center p-2 rounded-lg transition-colors min-w-[60px] ${
        hasStrongs
          ? 'hover:bg-blue-50 dark:hover:bg-blue-950 cursor-pointer'
          : 'cursor-default opacity-75'
      }`}
    >
      <span className="text-sm text-zinc-600 dark:text-zinc-300">{word.text}</span>
      <span className="text-lg font-serif text-blue-700 dark:text-blue-400">{word.original}</span>
      <span className="text-xs italic text-zinc-500 dark:text-zinc-400">
        {word.transliteration}
      </span>
      {hasStrongs && (
        <span className="mt-1 rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs dark:bg-zinc-800">
          {word.strongsNumber}
        </span>
      )}
    </button>
  );
}

function InterlinearVerseLine({
  verse,
  onWordClick,
}: {
  verse: InterlinearVerse;
  onWordClick?: (word: InterlinearWord) => void;
}): React.ReactElement {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="rounded bg-zinc-100 px-2 py-0.5 text-sm font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          {verse.verse}
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {verse.words.map((word, i) => (
          <InterlinearWordCard key={`${verse.verse}-${i}`} word={word} onClick={onWordClick} />
        ))}
      </div>
    </div>
  );
}

function LoadingSkeleton(): React.ReactElement {
  return (
    <div className="animate-pulse space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-12 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map(j => (
              <div key={j} className="h-20 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function InterlinearDisplay({
  verses,
  loading,
  error,
  onWordClick,
}: InterlinearDisplayProps): React.ReactElement {
  if (loading) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
        <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Interlinear View
        </h3>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950 rounded-lg p-6 border border-red-200 dark:border-red-800">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (verses.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-700 dark:bg-zinc-900">
        <p className="text-center text-zinc-500 dark:text-zinc-400">
          Enable interlinear view to see word-by-word Greek/Hebrew text
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Interlinear View</h3>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Click a word to see its Strong&apos;s definition
        </span>
      </div>
      <div className="space-y-4">
        {verses.map(verse => (
          <InterlinearVerseLine
            key={`${verse.book}-${verse.chapter}-${verse.verse}`}
            verse={verse}
            onWordClick={onWordClick}
          />
        ))}
      </div>
    </div>
  );
}
