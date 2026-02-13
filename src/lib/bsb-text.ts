/**
 * Helpers for grounding features in the actual BSB text.
 */

import { parseVerseReference } from '@/lib/verse-parser';
import { getBookCode } from '@/lib/bible';
import type { InterlinearWord } from '@/types';

interface BookData {
  book: string;
  chapters: Record<string, Record<string, InterlinearWord[]>>;
}

function loadBookData(bookCode: string): BookData | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const data = require(`@/data/bsb/${bookCode}.json`) as BookData;
    return data;
  } catch {
    return null;
  }
}

function renderVerseText(words: InterlinearWord[]): string {
  const raw = words
    .slice()
    .sort((a, b) => a.position - b.position)
    .map(w => w.text)
    .join(' ');

  return raw
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isValidBsbReference(reference: string): boolean {
  const parsed = parseVerseReference(reference);
  if (!parsed) return false;

  const bookCode = getBookCode(parsed.book);
  if (!bookCode) return false;

  const bookData = loadBookData(bookCode);
  if (!bookData) return false;

  const chapterData = bookData.chapters[String(parsed.chapter)];
  if (!chapterData) return false;

  const words = chapterData[String(parsed.startVerse)];
  return Array.isArray(words) && words.length > 0;
}

export function getBsbPassageText(
  reference: string,
  maxVerses: number = 20
): {
  bookCode: string;
  chapter: number;
  verseCount: number;
  truncated: boolean;
  text: string;
} | null {
  const parsed = parseVerseReference(reference);
  if (!parsed) return null;

  const bookCode = getBookCode(parsed.book);
  if (!bookCode) return null;

  const bookData = loadBookData(bookCode);
  if (!bookData) return null;

  const chapterData = bookData.chapters[String(parsed.chapter)];
  if (!chapterData) return null;

  const start = parsed.startVerse;
  const end = parsed.endVerse ?? parsed.startVerse;

  const verseNumbers: number[] = [];
  for (let v = start; v <= end; v++) {
    verseNumbers.push(v);
    if (verseNumbers.length >= maxVerses) break;
  }

  const truncated = verseNumbers.length < end - start + 1;

  const lines: string[] = [];
  for (const verseNum of verseNumbers) {
    const words = chapterData[String(verseNum)];
    if (!words) {
      return null;
    }
    lines.push(`${bookCode} ${parsed.chapter}:${verseNum} ${renderVerseText(words)}`);
  }

  return {
    bookCode,
    chapter: parsed.chapter,
    verseCount: verseNumbers.length,
    truncated,
    text: lines.join('\n'),
  };
}
