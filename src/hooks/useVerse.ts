/**
 * useVerse hook
 * Fetches and manages verse data
 */

'use client';

import { useState, useCallback } from 'react';
import type { VerseData, Translation } from '@/types';

interface UseVerseReturn {
  verse: VerseData | null;
  loading: boolean;
  error: string | null;
  fetchVerse: (reference: string, translation?: Translation) => Promise<void>;
  clear: () => void;
}

export function useVerse(): UseVerseReturn {
  const [verse, setVerse] = useState<VerseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVerse = useCallback(
    async (reference: string, translation: Translation = 'ESV'): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/verse?reference=${encodeURIComponent(reference)}&translation=${translation}`
        );

        if (!response.ok) {
          const errorData = (await response.json()) as { error?: string };
          throw new Error(errorData.error ?? 'Failed to fetch verse');
        }

        const data = (await response.json()) as VerseData;
        setVerse(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setError(message);
        setVerse(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clear = useCallback((): void => {
    setVerse(null);
    setError(null);
  }, []);

  return {
    verse,
    loading,
    error,
    fetchVerse,
    clear,
  };
}
