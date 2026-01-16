/**
 * Sermon companion types
 */

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
