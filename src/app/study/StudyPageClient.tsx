'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { Alert } from '@/components/Alert';
import { VerseDisplay } from '@/components/VerseDisplay';
import { OriginalLanguage } from '@/components/OriginalLanguage';
import { useVerse } from '@/hooks/useVerse';
import { useInterlinear } from '@/hooks/useInterlinear';
import { getBookCode } from '@/lib/bible';
import { parseVerseReference } from '@/lib/verse-parser';
import type { Translation, OriginalLanguageWord, StrongsEntry, InterlinearWord } from '@/types';

// Dynamic import for heavy InterlinearDisplay component (reduces initial bundle)
const InterlinearDisplay = dynamic(
  () => import('@/components/InterlinearDisplay').then(mod => mod.InterlinearDisplay),
  {
    loading: () => (
      <div className="animate-pulse space-y-4">
        <div className="h-24 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-24 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </div>
    ),
  }
);

export function StudyPageClient(): React.ReactElement {
  const searchParams = useSearchParams();
  const [reference, setReference] = useState('');
  const [translation, setTranslation] = useState<Translation>('ESV');
  const { verse, loading, error, fetchVerse, clear: clearVerse } = useVerse();

  // Interlinear state
  const [showInterlinear, setShowInterlinear] = useState(false);
  const {
    verses: interlinearVerses,
    loading: interlinearLoading,
    error: interlinearError,
    fetchInterlinear,
    clear: clearInterlinear,
  } = useInterlinear();

  // Strong's lookup state
  const [strongsNumber, setStrongsNumber] = useState('');
  const [strongsLoading, setStrongsLoading] = useState(false);
  const [strongsError, setStrongsError] = useState<string | null>(null);
  const [originalWords, setOriginalWords] = useState<OriginalLanguageWord[]>([]);
  const lastStrongsQueryRef = useRef<string>('');

  const quickStarts = useMemo(
    () => [
      { label: 'John 3:16', reference: 'John 3:16', translation: 'ESV' as Translation },
      { label: 'Psalm 23:1', reference: 'Psalm 23:1', translation: 'ESV' as Translation },
      { label: 'Romans 8:28', reference: 'Romans 8:28', translation: 'ESV' as Translation },
      {
        label: 'Try interlinear: John 1:1',
        reference: 'John 1:1',
        translation: 'BSB' as Translation,
        interlinear: true,
      },
    ],
    []
  );

  const runLookup = useCallback(
    async (ref: string, tr: Translation, includeInterlinear: boolean): Promise<void> => {
      const trimmed = ref.trim();
      if (trimmed === '') return;

      await fetchVerse(trimmed, tr);

      if (!includeInterlinear) return;

      const parsed = parseVerseReference(trimmed);
      if (!parsed) return;
      const bookCode = getBookCode(parsed.book);
      if (!bookCode) return;
      await fetchInterlinear(bookCode, parsed.chapter, parsed.startVerse);
    },
    [fetchInterlinear, fetchVerse]
  );

  useEffect(() => {
    const refParam = searchParams.get('reference') ?? searchParams.get('ref');
    if (refParam == null || refParam.trim() === '') return;

    const translationParam = (searchParams.get('translation') ?? 'ESV').toUpperCase();
    const allowed: Translation[] = ['ESV', 'BSB', 'NIV', 'KJV'];
    const tr = (
      allowed.includes(translationParam as Translation) ? (translationParam as Translation) : 'ESV'
    ) satisfies Translation;

    const interlinearParam = searchParams.get('interlinear');
    const shouldInterlinear = interlinearParam === '1' || interlinearParam === 'true';

    setReference(refParam);
    setTranslation(tr);
    setShowInterlinear(shouldInterlinear);

    void runLookup(refParam, tr, shouldInterlinear);
  }, [runLookup, searchParams]);

  const fetchStrongsEntry = useCallback(async (number: string): Promise<void> => {
    if (!number.trim()) return;
    lastStrongsQueryRef.current = number.trim();

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
    void runLookup(reference, translation, showInterlinear);
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
      void runLookup(reference, translation, true);
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
      <AuthHeader title="Scripture Deep Dive" />

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Start with a passage, then explore the original words at your own pace.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {quickStarts.map(item => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setReference(item.reference);
                  setTranslation(item.translation);
                  const wantsInterlinear = item.interlinear === true;
                  setShowInterlinear(wantsInterlinear);
                  void runLookup(item.reference, item.translation, wantsInterlinear);
                }}
                className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label htmlFor="reference" className="sr-only">
              Verse reference
            </label>
            <input
              id="reference"
              name="reference"
              type="text"
              value={reference}
              onChange={e => setReference(e.target.value)}
              placeholder="Enter verse reference (e.g., John 3:16)"
              className="w-full flex-1 rounded-lg border border-zinc-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
            <label htmlFor="translation" className="sr-only">
              Translation
            </label>
            <select
              id="translation"
              name="translation"
              aria-label="Translation"
              value={translation}
              onChange={e => setTranslation(e.target.value as Translation)}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 sm:w-auto"
            >
              <option value="ESV">ESV</option>
              <option value="BSB">BSB</option>
              <option value="NIV">NIV</option>
              <option value="KJV">KJV</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 sm:w-auto"
            >
              {loading ? 'Loading…' : 'Search'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-6">
            <Alert
              variant="error"
              title="Could not load verse"
              description={error}
              actionLabel="Retry"
              onAction={() => void runLookup(reference, translation, showInterlinear)}
              onDismiss={clearVerse}
            />
          </div>
        )}

        {/* Interlinear Toggle */}
        <div className="mb-6 flex items-center gap-3">
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={showInterlinear}
              onChange={handleInterlinearToggle}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-zinc-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-zinc-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-zinc-600 dark:bg-zinc-700"></div>
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
                  {strongsLoading ? '…' : 'Look Up'}
                </button>
              </div>
            </form>

            {/* Strong's Error */}
            {strongsError && (
              <div className="mb-4">
                <Alert
                  variant="error"
                  title="Strong's lookup failed"
                  description={strongsError}
                  actionLabel={lastStrongsQueryRef.current ? 'Retry' : undefined}
                  onAction={
                    lastStrongsQueryRef.current
                      ? () => void fetchStrongsEntry(lastStrongsQueryRef.current)
                      : undefined
                  }
                  onDismiss={() => setStrongsError(null)}
                />
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
            {interlinearError && (
              <div className="mb-4">
                <Alert
                  variant="warning"
                  title="Interlinear view unavailable"
                  description={interlinearError}
                  actionLabel="Retry"
                  onAction={() => void runLookup(reference, translation, true)}
                  onDismiss={clearInterlinear}
                />
              </div>
            )}
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
