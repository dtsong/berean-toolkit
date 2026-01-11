/**
 * Verse reference parsing utilities
 * Handles various formats: "John 3:16", "Jn 3:16", "John 3:16-18", "1 Corinthians 13:4-7"
 */

import type { VerseReference } from '@/types';

// Book name mappings (abbreviations to full names)
const BOOK_MAPPINGS: Record<string, string> = {
  // Old Testament
  gen: 'Genesis',
  ge: 'Genesis',
  gn: 'Genesis',
  ex: 'Exodus',
  exo: 'Exodus',
  exod: 'Exodus',
  lev: 'Leviticus',
  lv: 'Leviticus',
  num: 'Numbers',
  nm: 'Numbers',
  nu: 'Numbers',
  deut: 'Deuteronomy',
  dt: 'Deuteronomy',
  de: 'Deuteronomy',
  // ... more can be added
  // New Testament
  mt: 'Matthew',
  matt: 'Matthew',
  mk: 'Mark',
  mr: 'Mark',
  lk: 'Luke',
  lu: 'Luke',
  jn: 'John',
  joh: 'John',
  acts: 'Acts',
  ac: 'Acts',
  rom: 'Romans',
  ro: 'Romans',
  '1co': '1 Corinthians',
  '1cor': '1 Corinthians',
  '2co': '2 Corinthians',
  '2cor': '2 Corinthians',
  gal: 'Galatians',
  ga: 'Galatians',
  eph: 'Ephesians',
  php: 'Philippians',
  phil: 'Philippians',
  col: 'Colossians',
  '1th': '1 Thessalonians',
  '1thess': '1 Thessalonians',
  '2th': '2 Thessalonians',
  '2thess': '2 Thessalonians',
  '1ti': '1 Timothy',
  '1tim': '1 Timothy',
  '2ti': '2 Timothy',
  '2tim': '2 Timothy',
  tit: 'Titus',
  phm: 'Philemon',
  philem: 'Philemon',
  heb: 'Hebrews',
  jas: 'James',
  jam: 'James',
  '1pe': '1 Peter',
  '1pet': '1 Peter',
  '2pe': '2 Peter',
  '2pet': '2 Peter',
  '1jn': '1 John',
  '1jo': '1 John',
  '2jn': '2 John',
  '2jo': '2 John',
  '3jn': '3 John',
  '3jo': '3 John',
  jude: 'Jude',
  jud: 'Jude',
  rev: 'Revelation',
  re: 'Revelation',
};

/**
 * Normalize book name from abbreviation or variant spelling
 */
export function normalizeBookName(input: string): string {
  const lower = input.toLowerCase().trim();
  return BOOK_MAPPINGS[lower] ?? input;
}

/**
 * Parse a verse reference string into structured data
 * @param reference - e.g., "John 3:16", "1 Cor 13:4-7"
 * @returns Parsed verse reference or null if invalid
 */
export function parseVerseReference(reference: string): VerseReference | null {
  // Pattern: (optional number + book name) (chapter):(verse or verse range)
  const pattern = /^(\d?\s*\w+)\s+(\d+):(\d+)(?:-(\d+))?$/i;
  const match = reference.trim().match(pattern);

  if (!match) {
    return null;
  }

  const [, bookPart, chapterStr, startVerseStr, endVerseStr] = match;
  const book = normalizeBookName(bookPart ?? '');
  const chapter = parseInt(chapterStr ?? '0', 10);
  const startVerse = parseInt(startVerseStr ?? '0', 10);
  const endVerse = endVerseStr != null ? parseInt(endVerseStr, 10) : undefined;

  if (isNaN(chapter) || isNaN(startVerse)) {
    return null;
  }

  return {
    book,
    chapter,
    startVerse,
    endVerse,
  };
}

/**
 * Format a verse reference back to string
 */
export function formatVerseReference(ref: VerseReference): string {
  const base = `${ref.book} ${ref.chapter}:${ref.startVerse}`;
  return ref.endVerse != null ? `${base}-${ref.endVerse}` : base;
}
