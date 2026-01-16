/**
 * Game types for Berean Challenge
 */

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
