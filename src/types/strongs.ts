/**
 * Strong's Concordance and interlinear types
 */

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
