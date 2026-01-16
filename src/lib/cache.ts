/**
 * React.cache() wrappers for server-side request deduplication
 * These functions deduplicate requests within a single server request
 * Note: Only works in Server Components, not client components
 */

import { cache } from 'react';
import type { VerseData, Translation, InterlinearVerse } from '@/types';

/**
 * Cached verse fetch - deduplicates verse requests within a single request
 */
export const getCachedVerse = cache(
  async (reference: string, translation: Translation): Promise<VerseData | null> => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000';
      const response = await fetch(
        `${baseUrl}/api/verse?reference=${encodeURIComponent(reference)}&translation=${translation}`,
        { cache: 'no-store' } // Don't HTTP cache, just deduplicate in-request
      );

      if (!response.ok) return null;
      return (await response.json()) as VerseData;
    } catch {
      return null;
    }
  }
);

/**
 * Cached interlinear fetch - deduplicates interlinear chapter requests
 */
export const getCachedInterlinear = cache(
  async (
    book: string,
    chapter: number,
    startVerse?: number,
    endVerse?: number
  ): Promise<InterlinearVerse[] | null> => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000';
      let url = `${baseUrl}/api/interlinear/${book}/${chapter}`;

      if (startVerse !== undefined) {
        url += `?startVerse=${startVerse}`;
        if (endVerse !== undefined) {
          url += `&endVerse=${endVerse}`;
        }
      }

      const response = await fetch(url, { cache: 'no-store' });

      if (!response.ok) return null;
      return (await response.json()) as InterlinearVerse[];
    } catch {
      return null;
    }
  }
);

/**
 * Cached Strong's entry fetch - deduplicates Strong's lookups
 */
export const getCachedStrongsEntry = cache(async (number: string) => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/strongs/${number}`, {
      cache: 'no-store',
    });

    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
});
