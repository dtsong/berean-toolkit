/**
 * Bible data utilities for fetching and processing Bible text
 */

import type { BibleChapter, BibleVerse, VerseReference } from '@/types';
import { parseVerseReference } from './verse-parser';
import { getBookCodeFromName } from './book-codes';

/**
 * Get the 3-letter book code from a book name
 */
export function getBookCode(bookName: string): string | null {
  return getBookCodeFromName(bookName);
}

/**
 * Fetch a Bible chapter from the BSB API
 */
export async function fetchBSBChapter(
  bookCode: string,
  chapter: number
): Promise<BibleChapter | null> {
  try {
    const response = await fetch(`/api/bible/${bookCode}/${chapter}`);
    if (!response.ok) {
      console.error(`Failed to fetch chapter: ${response.status}`);
      return null;
    }
    return (await response.json()) as BibleChapter;
  } catch (error) {
    console.error('Failed to fetch Bible chapter:', error);
    return null;
  }
}

/**
 * Fetch specific verses from a chapter
 */
export async function fetchBSBVerses(reference: VerseReference): Promise<BibleVerse[] | null> {
  const bookCode = getBookCode(reference.book);
  if (!bookCode) {
    console.error(`Unknown book: ${reference.book}`);
    return null;
  }

  const chapter = await fetchBSBChapter(bookCode, reference.chapter);
  if (!chapter) {
    return null;
  }

  // Filter verses by range
  const startVerse = reference.startVerse;
  const endVerse = reference.endVerse ?? reference.startVerse;

  return chapter.verses.filter(v => v.verse >= startVerse && v.verse <= endVerse);
}

/**
 * Fetch verses from a reference string (e.g., "John 3:16" or "Romans 8:28-30")
 */
export async function fetchVersesByReference(
  referenceString: string
): Promise<BibleVerse[] | null> {
  const reference = parseVerseReference(referenceString);
  if (!reference) {
    console.error(`Could not parse reference: ${referenceString}`);
    return null;
  }

  return fetchBSBVerses(reference);
}

/**
 * Determine if a book is from the Old Testament (Hebrew) or New Testament (Greek)
 */
export function getTestament(bookCode: string): 'OT' | 'NT' {
  const otBooks = [
    'GEN',
    'EXO',
    'LEV',
    'NUM',
    'DEU',
    'JOS',
    'JDG',
    'RUT',
    '1SA',
    '2SA',
    '1KI',
    '2KI',
    '1CH',
    '2CH',
    'EZR',
    'NEH',
    'EST',
    'JOB',
    'PSA',
    'PRO',
    'ECC',
    'SNG',
    'ISA',
    'JER',
    'LAM',
    'EZK',
    'DAN',
    'HOS',
    'JOL',
    'AMO',
    'OBA',
    'JON',
    'MIC',
    'NAM',
    'HAB',
    'ZEP',
    'HAG',
    'ZEC',
    'MAL',
  ];

  return otBooks.includes(bookCode.toUpperCase()) ? 'OT' : 'NT';
}

/**
 * Get the original language for a book
 */
export function getOriginalLanguage(bookCode: string): 'Hebrew' | 'Greek' {
  return getTestament(bookCode) === 'OT' ? 'Hebrew' : 'Greek';
}

/**
 * Format a verse reference for display
 */
export function formatReference(
  book: string,
  chapter: number,
  startVerse: number,
  endVerse?: number
): string {
  if (endVerse && endVerse !== startVerse) {
    return `${book} ${chapter}:${startVerse}-${endVerse}`;
  }
  return `${book} ${chapter}:${startVerse}`;
}
