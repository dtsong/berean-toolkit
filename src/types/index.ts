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
  lemma: string; // Original Hebrew/Greek word
  transliteration: string;
  definition: string;
  kjvUsage?: string[];
}

// Verse display types
export interface VerseData {
  reference: VerseReference;
  text: string;
  translation: Translation;
}

export interface OriginalLanguageWord {
  word: string;
  transliteration: string;
  strongsNumber: string;
  definition: string;
  partOfSpeech?: string;
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
