'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { VerseDisplay } from '@/components/VerseDisplay';
import { OriginalLanguage } from '@/components/OriginalLanguage';
import { InterlinearDisplay } from '@/components/InterlinearDisplay';
import { useVerse } from '@/hooks/useVerse';
import { useInterlinear } from '@/hooks/useInterlinear';
import { getBookCode } from '@/lib/bible';
import { parseVerseReference } from '@/lib/verse-parser';
import type { Translation, OriginalLanguageWord, StrongsEntry, InterlinearWord } from '@/types';

export default function StudyPage(): React.ReactElement {
  const [reference, setReference] = useState('');
  const [translation, setTranslation] = useState<Translation>('ESV');
  const { verse, loading, error, fetchVerse } = useVerse();

  // Interlinear state
  const [showInterlinear, setShowInterlinear] = useState(false);
  const {
    verses: interlinearVerses,
    loading: interlinearLoading,
    error: interlinearError,
    fetchInterlinear,
  } = useInterlinear();

  // Strong's lookup state
  const [strongsNumber, setStrongsNumber] = useState('');
  const [strongsLoading, setStrongsLoading] = useState(false);
  const [strongsError, setStrongsError] = useState<string | null>(null);
  const [originalWords, setOriginalWords] = useState<OriginalLanguageWord[]>([]);

  const fetchStrongsEntry = useCallback(async (number: string): Promise<void> => {
    if (!number.trim()) return;

    setStrongsLoading(true);
    setStrongsError(null);

    try {
      const response = await fetch(`/api/strongs/${number.trim()}`);
      if (!response.ok) {
        const data = (await response.json()) as { error: string };
        setStrongsError(data.error || "Failed to fetch Strong's entry");
        return;
      }

      const entry = (await response.json()) as StrongsEntry & { language: string };

      // Add to the list of words (prepend to show most recent first)
      setOriginalWords(prev => {
        // Avoid duplicates
        const filtered = prev.filter(w => w.strongsNumber !== entry.number);
        return [
          {
            word: entry.lemma || entry.word || '',
            transliteration: entry.transliteration,
            strongsNumber: entry.number || number.toUpperCase(),
            definition: entry.definition,
            partOfSpeech: entry.partOfSpeech,
          },
          ...filtered,
        ].slice(0, 10); // Keep last 10 lookups
      });
    } catch {
      setStrongsError("Failed to fetch Strong's entry");
    } finally {
      setStrongsLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (reference.trim() !== '') {
      void fetchVerse(reference, translation);

      // Also fetch interlinear if enabled
      if (showInterlinear) {
        const parsed = parseVerseReference(reference);
        if (parsed) {
          const bookCode = getBookCode(parsed.book);
          if (bookCode) {
            void fetchInterlinear(bookCode, parsed.chapter, parsed.startVerse);
          }
        }
      }
    }
  };

  const handleInterlinearWordClick = (word: InterlinearWord): void => {
    if (word.strongsNumber) {
      void fetchStrongsEntry(word.strongsNumber);
    }
  };

  const handleInterlinearToggle = (): void => {
    const newValue = !showInterlinear;
    setShowInterlinear(newValue);

    // Fetch interlinear if toggling on and we have a verse
    if (newValue && verse) {
      const parsed = parseVerseReference(reference);
      if (parsed) {
        const bookCode = getBookCode(parsed.book);
        if (bookCode) {
          void fetchInterlinear(bookCode, parsed.chapter, parsed.startVerse);
        }
      }
    }
  };

  const handleStrongsSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    void fetchStrongsEntry(strongsNumber);
    setStrongsNumber('');
  };

  const clearStrongsHistory = (): void => {
    setOriginalWords([]);
    setStrongsError(null);
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
              <option value="BSB">BSB</option>
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

        {/* Interlinear Toggle */}
        <div className="mb-6 flex items-center gap-3">
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={showInterlinear}
              onChange={handleInterlinearToggle}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-gray-700"></div>
          </label>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Show Interlinear (Greek/Hebrew)
          </span>
        </div>

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
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Strong&apos;s Lookup
              </h2>
              {originalWords.length > 0 && (
                <button
                  onClick={clearStrongsHistory}
                  className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                  type="button"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Strong's Lookup Form */}
            <form onSubmit={handleStrongsSubmit} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={strongsNumber}
                  onChange={e => setStrongsNumber(e.target.value)}
                  placeholder="Enter Strong's # (e.g., G3056, H430)"
                  className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                />
                <button
                  type="submit"
                  disabled={strongsLoading || !strongsNumber.trim()}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                >
                  {strongsLoading ? '...' : 'Look Up'}
                </button>
              </div>
            </form>

            {/* Strong's Error */}
            {strongsError && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {strongsError}
              </div>
            )}

            {/* Quick Lookup Suggestions */}
            {originalWords.length === 0 && !strongsError && (
              <div className="mb-4 rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
                <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Try these common words:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { num: 'G26', label: 'agape (love)' },
                    { num: 'G3056', label: 'logos (word)' },
                    { num: 'H430', label: 'Elohim (God)' },
                    { num: 'H2617', label: 'chesed (mercy)' },
                  ].map(item => (
                    <button
                      key={item.num}
                      onClick={() => void fetchStrongsEntry(item.num)}
                      className="rounded-full bg-zinc-200 px-3 py-1 text-xs text-zinc-700 transition-colors hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
                      type="button"
                    >
                      {item.num}: {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <OriginalLanguage words={originalWords} loading={strongsLoading} />
          </div>
        </div>

        {/* Interlinear Display */}
        {showInterlinear && (
          <div className="mt-8">
            <InterlinearDisplay
              verses={interlinearVerses}
              loading={interlinearLoading}
              error={interlinearError}
              onWordClick={handleInterlinearWordClick}
            />
          </div>
        )}

        {/* Feature Status */}
        <div className="mt-8 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <p className="text-sm text-green-800 dark:text-green-200">
            <strong>Features:</strong> Strong&apos;s Concordance with 14,000+ entries. Word-level
            interlinear display with clickable Greek/Hebrew words. Powered by the Berean Standard
            Bible.
          </p>
        </div>
      </main>
    </div>
  );
}
