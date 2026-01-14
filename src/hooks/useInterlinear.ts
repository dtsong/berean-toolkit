/**
 * Hook for fetching interlinear Bible data
 */

import { useState, useCallback } from 'react';
import type { InterlinearVerse } from '@/types';

interface UseInterlinearReturn {
  verses: InterlinearVerse[];
  loading: boolean;
  error: string | null;
  fetchInterlinear: (bookCode: string, chapter: number, verse?: number) => Promise<void>;
  clear: () => void;
}

export function useInterlinear(): UseInterlinearReturn {
  const [verses, setVerses] = useState<InterlinearVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInterlinear = useCallback(
    async (bookCode: string, chapter: number, verse?: number) => {
      setLoading(true);
      setError(null);

      try {
        let url = `/api/interlinear/${bookCode}/${chapter}`;
        if (verse !== undefined) {
          url += `?verse=${verse}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch interlinear data');
        }

        setVerses(data.verses || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setError(message);
        setVerses([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clear = useCallback(() => {
    setVerses([]);
    setError(null);
  }, []);

  return { verses, loading, error, fetchInterlinear, clear };
}
