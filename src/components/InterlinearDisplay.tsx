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
      <span className="text-sm text-gray-600 dark:text-gray-400">{word.text}</span>
      <span className="text-lg font-serif text-blue-700 dark:text-blue-400">{word.original}</span>
      <span className="text-xs text-gray-500 dark:text-gray-500 italic">
        {word.transliteration}
      </span>
      {hasStrongs && (
        <span className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded mt-1 font-mono">
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
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
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
          <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map(j => (
              <div key={j} className="w-16 h-20 bg-gray-200 dark:bg-gray-700 rounded" />
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
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
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
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400 text-center">
          Enable interlinear view to see word-by-word Greek/Hebrew text
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Interlinear View</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
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
