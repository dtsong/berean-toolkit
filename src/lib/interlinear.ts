/**
 * Interlinear Bible utilities
 * Functions for fetching word-by-word Greek/Hebrew data
 */

import type { InterlinearWord, InterlinearVerse, InterlinearChapter } from '@/types';

interface BookData {
  book: string;
  chapters: Record<string, Record<string, InterlinearWord[]>>;
}

export async function fetchInterlinearChapter(
  bookCode: string,
  chapter: number
): Promise<InterlinearChapter | null> {
  try {
    const response = await fetch(`/api/interlinear/${bookCode}/${chapter}`);
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export async function fetchInterlinearVerse(
  bookCode: string,
  chapter: number,
  verse: number
): Promise<InterlinearVerse | null> {
  try {
    const response = await fetch(`/api/interlinear/${bookCode}/${chapter}?verse=${verse}`);
    if (!response.ok) return null;

    const data: InterlinearChapter = await response.json();
    return data.verses.find(v => v.verse === verse) || null;
  } catch {
    return null;
  }
}

export function loadBookData(bookCode: string): BookData | null {
  try {
    // Dynamic import for server-side usage
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const data = require(`@/data/bsb/${bookCode}.json`);
    return data as BookData;
  } catch {
    return null;
  }
}

export function getChapterFromBookData(
  bookData: BookData,
  chapter: number
): InterlinearVerse[] | null {
  const chapterData = bookData.chapters[chapter.toString()];
  if (!chapterData) return null;

  const verses: InterlinearVerse[] = [];

  for (const [verseNum, words] of Object.entries(chapterData)) {
    verses.push({
      book: bookData.book,
      chapter,
      verse: parseInt(verseNum, 10),
      words,
    });
  }

  // Sort by verse number
  verses.sort((a, b) => a.verse - b.verse);

  return verses;
}

export function getVerseFromBookData(
  bookData: BookData,
  chapter: number,
  verse: number
): InterlinearVerse | null {
  const chapterData = bookData.chapters[chapter.toString()];
  if (!chapterData) return null;

  const words = chapterData[verse.toString()];
  if (!words) return null;

  return {
    book: bookData.book,
    chapter,
    verse,
    words,
  };
}
