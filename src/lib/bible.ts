/**
 * Bible data utilities for fetching and processing Bible text
 */

import type { BibleChapter, BibleVerse, VerseReference } from '@/types';
import { parseVerseReference } from './verse-parser';

// Book code mapping for API calls
const BOOK_CODES: Record<string, string> = {
  Genesis: 'GEN',
  Exodus: 'EXO',
  Leviticus: 'LEV',
  Numbers: 'NUM',
  Deuteronomy: 'DEU',
  Joshua: 'JOS',
  Judges: 'JDG',
  Ruth: 'RUT',
  '1 Samuel': '1SA',
  '2 Samuel': '2SA',
  '1 Kings': '1KI',
  '2 Kings': '2KI',
  '1 Chronicles': '1CH',
  '2 Chronicles': '2CH',
  Ezra: 'EZR',
  Nehemiah: 'NEH',
  Esther: 'EST',
  Job: 'JOB',
  Psalms: 'PSA',
  Proverbs: 'PRO',
  Ecclesiastes: 'ECC',
  'Song of Solomon': 'SNG',
  Isaiah: 'ISA',
  Jeremiah: 'JER',
  Lamentations: 'LAM',
  Ezekiel: 'EZK',
  Daniel: 'DAN',
  Hosea: 'HOS',
  Joel: 'JOL',
  Amos: 'AMO',
  Obadiah: 'OBA',
  Jonah: 'JON',
  Micah: 'MIC',
  Nahum: 'NAM',
  Habakkuk: 'HAB',
  Zephaniah: 'ZEP',
  Haggai: 'HAG',
  Zechariah: 'ZEC',
  Malachi: 'MAL',
  Matthew: 'MAT',
  Mark: 'MRK',
  Luke: 'LUK',
  John: 'JHN',
  Acts: 'ACT',
  Romans: 'ROM',
  '1 Corinthians': '1CO',
  '2 Corinthians': '2CO',
  Galatians: 'GAL',
  Ephesians: 'EPH',
  Philippians: 'PHP',
  Colossians: 'COL',
  '1 Thessalonians': '1TH',
  '2 Thessalonians': '2TH',
  '1 Timothy': '1TI',
  '2 Timothy': '2TI',
  Titus: 'TIT',
  Philemon: 'PHM',
  Hebrews: 'HEB',
  James: 'JAS',
  '1 Peter': '1PE',
  '2 Peter': '2PE',
  '1 John': '1JN',
  '2 John': '2JN',
  '3 John': '3JN',
  Jude: 'JUD',
  Revelation: 'REV',
};

/**
 * Get the 3-letter book code from a book name
 */
export function getBookCode(bookName: string): string | null {
  // Direct match
  if (BOOK_CODES[bookName]) {
    return BOOK_CODES[bookName];
  }

  // Try case-insensitive match
  const lowerBookName = bookName.toLowerCase();
  for (const [name, code] of Object.entries(BOOK_CODES)) {
    if (name.toLowerCase() === lowerBookName) {
      return code;
    }
  }

  // Handle common variations
  const variations: Record<string, string> = {
    'song of songs': 'SNG',
    songs: 'SNG',
    psalm: 'PSA',
    '1sam': '1SA',
    '2sam': '2SA',
    '1kgs': '1KI',
    '2kgs': '2KI',
    '1chr': '1CH',
    '2chr': '2CH',
    '1cor': '1CO',
    '2cor': '2CO',
    '1thess': '1TH',
    '2thess': '2TH',
    '1tim': '1TI',
    '2tim': '2TI',
    '1pet': '1PE',
    '2pet': '2PE',
    '1jn': '1JN',
    '2jn': '2JN',
    '3jn': '3JN',
  };

  return variations[lowerBookName] || null;
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
