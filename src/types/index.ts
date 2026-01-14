/**
 * Core application types for Berean Toolkit
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

// Strong's concordance types
export interface StrongsEntry {
  number: string; // e.g., "H430" or "G2316"
  lemma: string; // Original Hebrew/Greek word (alias for word)
  word?: string; // Original Hebrew/Greek word
  transliteration: string;
  pronunciation?: string;
  definition: string;
  partOfSpeech?: string;
  kjvUsage?: string[];
}

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

export interface OriginalLanguageWord {
  word: string;
  transliteration: string;
  strongsNumber: string;
  definition: string;
  partOfSpeech?: string;
}

// Interlinear types for word-by-word display
export interface InterlinearWord {
  position: number;
  text: string; // English/BSB word
  original: string; // Greek/Hebrew characters
  transliteration: string;
  strongsNumber: string; // H#### or G####
  morphology?: string; // Part of speech, tense, etc.
}

export interface InterlinearVerse {
  book: string;
  chapter: number;
  verse: number;
  words: InterlinearWord[];
}

export interface InterlinearChapter {
  book: string;
  chapter: number;
  verses: InterlinearVerse[];
}

// Game types for Berean Challenge
export type GameMode = 'verse_detective' | 'context_clues' | 'word_connections';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  mode: GameMode;
  difficulty: Difficulty;
  verseReference: string;
  questionText: string;
  correctAnswer: string;
  incorrectAnswers: string[];
  strongsNumber?: string;
  explanation?: string;
}

export interface GameProgress {
  mode: GameMode;
  questionsAnswered: number;
  correctAnswers: number;
  currentStreak: number;
  bestStreak: number;
}

// Sermon companion types
export interface SermonOutline {
  title?: string;
  passage: string;
  mainPoints: OutlinePoint[];
  keyThemes: string[];
  crossReferences: string[];
}

export interface OutlinePoint {
  heading: string;
  subPoints: string[];
  verseRange?: string;
}

export interface ReflectionQuestion {
  question: string;
  category: 'observation' | 'interpretation' | 'application';
  relatedVerse?: string;
}

// User profile types
export interface UserProfile {
  id: string;
  username?: string;
  displayName?: string;
  preferredTranslation: Translation;
  createdAt: Date;
  updatedAt: Date;
}
