/**
 * GameBoard component
 * Main interface for Berean Challenge game
 */

'use client';

import { useState, useMemo } from 'react';
import type { Question, GameMode } from '@/types';

// Fisher-Yates shuffle - pure function that takes a seed
function shuffleArray<T>(array: T[], seed: string): T[] {
  const result = [...array];
  // Simple hash function to generate consistent shuffles for the same question
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  // Use the hash to shuffle consistently
  for (let i = result.length - 1; i > 0; i--) {
    hash = Math.abs((hash * 1103515245 + 12345) & 0x7fffffff);
    const j = hash % (i + 1);
    [result[i], result[j]] = [result[j] as T, result[i] as T];
  }
  return result;
}

interface GameBoardProps {
  question: Question | null;
  mode: GameMode;
  onAnswer: (answer: string) => void;
  onNext: () => void;
}

export function GameBoard({
  question,
  mode,
  onAnswer,
  onNext,
}: GameBoardProps): React.ReactElement {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  // Memoize shuffled answers based on question ID
  const allAnswers = useMemo(() => {
    if (question == null) return [];
    const answers = [question.correctAnswer, ...question.incorrectAnswers];
    return shuffleArray(answers, question.id);
  }, [question]);

  if (question == null) {
    return (
      <div className="rounded-lg bg-zinc-100 p-8 text-center dark:bg-zinc-800">
        <p className="text-lg text-zinc-500 dark:text-zinc-400">Loading question...</p>
      </div>
    );
  }

  const handleAnswer = (answer: string): void => {
    if (revealed) return;
    setSelectedAnswer(answer);
    setRevealed(true);
    onAnswer(answer);
  };

  const handleNext = (): void => {
    setSelectedAnswer(null);
    setRevealed(false);
    onNext();
  };

  const getModeTitle = (): string => {
    switch (mode) {
      case 'verse_detective':
        return 'Verse Detective';
      case 'context_clues':
        return 'Context Clues';
      case 'word_connections':
        return 'Word Connections';
      default:
        return 'Berean Challenge';
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {getModeTitle()}
        </span>
        <span
          className={`rounded px-2 py-1 text-xs font-medium ${
            question.difficulty === 'easy'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
              : question.difficulty === 'medium'
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
          }`}
        >
          {question.difficulty}
        </span>
      </div>

      <div className="mb-6">
        <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
          {question.questionText}
        </p>
      </div>

      <div className="space-y-2">
        {allAnswers.map((answer, index) => {
          const isSelected = selectedAnswer === answer;
          const isCorrect = answer === question.correctAnswer;

          let buttonClass = 'w-full rounded-lg border p-3 text-left transition-colors ';

          if (!revealed) {
            buttonClass +=
              'border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800';
          } else if (isCorrect) {
            buttonClass +=
              'border-green-500 bg-green-50 dark:border-green-400 dark:bg-green-900/30';
          } else if (isSelected && !isCorrect) {
            buttonClass += 'border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-900/30';
          } else {
            buttonClass += 'border-zinc-200 opacity-50 dark:border-zinc-700';
          }

          return (
            <button
              key={index}
              onClick={() => handleAnswer(answer)}
              className={buttonClass}
              disabled={revealed}
              type="button"
            >
              <span className="text-zinc-900 dark:text-zinc-100">{answer}</span>
            </button>
          );
        })}
      </div>

      {revealed && question.explanation != null && (
        <div className="mt-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <p className="text-sm text-blue-800 dark:text-blue-200">{question.explanation}</p>
        </div>
      )}

      {revealed && (
        <button
          onClick={handleNext}
          className="mt-4 w-full rounded-lg bg-blue-600 py-2 font-medium text-white transition-colors hover:bg-blue-700"
          type="button"
        >
          Next Question
        </button>
      )}
    </div>
  );
}
