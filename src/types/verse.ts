/**
 * Verse and Bible-related types
 */

// Verse reference types
export interface VerseReference {
  book: string;
  chapter: number;
  startVerse: number;
  endVerse?: number;
}

// Translation options
export type Translation = 'ESV' | 'NIV' | 'NASB' | 'LSB' | 'BSB' | 'KJV';

// Verse display types
export interface VerseData {
  reference: VerseReference;
  text: string;
  translation: Translation;
}

// Bible API types
export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BibleChapter {
  book: string;
  bookName: string;
  chapter: number;
  verses: BibleVerse[];
  translation: Translation;
}
