'use client';

import { useState, useCallback, useEffect } from 'react';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { GameBoard } from '@/components/GameBoard';
import { useGameProgress } from '@/hooks/useGameProgress';
import type { Question, GameMode } from '@/types';

export default function BereanChallengePage(): React.ReactElement {
  const [mode, setMode] = useState<GameMode>('verse_detective');
  const [question, setQuestion] = useState<Question | null>(null);
  const { progress, recordAnswer, isAuthenticated } = useGameProgress();

  const currentProgress = progress[mode];

  const fetchQuestion = useCallback(async (gameMode: GameMode): Promise<void> => {
    try {
      const response = await fetch(`/api/game?mode=${gameMode}`);
      if (response.ok) {
        const data = (await response.json()) as Question;
        setQuestion(data);
      }
    } catch {
      console.error('Failed to fetch question');
    }
  }, []);

  useEffect(() => {
    void fetchQuestion(mode);
  }, [mode, fetchQuestion]);

  const handleModeChange = (newMode: GameMode): void => {
    setMode(newMode);
    setQuestion(null);
  };

  const handleAnswer = (answer: string): void => {
    const isCorrect = answer === question?.correctAnswer;
    void recordAnswer(mode, isCorrect);
  };

  const handleNext = (): void => {
    void fetchQuestion(mode);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <AuthHeader title="Berean Challenge">
        <div className="flex items-center gap-4 text-sm">
          {!isAuthenticated && (
            <span className="text-amber-600 dark:text-amber-400">Sign in to save progress</span>
          )}
          <span className="text-zinc-500 dark:text-zinc-400">
            Score: {currentProgress.correctAnswers}/{currentProgress.questionsAnswered}
          </span>
          <span className="text-green-600 dark:text-green-400">
            Streak: {currentProgress.currentStreak}
          </span>
        </div>
      </AuthHeader>

      <main className="mx-auto max-w-2xl px-6 py-8">
        {/* Mode Selection */}
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">Game Mode</h2>
          <div className="flex gap-2">
            {[
              { id: 'verse_detective', label: 'Verse Detective' },
              { id: 'context_clues', label: 'Context Clues' },
              { id: 'word_connections', label: 'Word Connections' },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => handleModeChange(m.id as GameMode)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  mode === m.id
                    ? 'bg-green-600 text-white'
                    : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                }`}
                type="button"
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Game Board */}
        <GameBoard question={question} mode={mode} onAnswer={handleAnswer} onNext={handleNext} />

        {/* Info Card */}
        <div className="mt-8 rounded-lg bg-zinc-100 p-4 dark:bg-zinc-900">
          <h3 className="mb-2 font-medium text-zinc-900 dark:text-zinc-100">How to Play</h3>
          <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <li>
              <strong>Verse Detective:</strong> Identify where a verse is found in Scripture
            </li>
            <li>
              <strong>Context Clues:</strong> Answer questions about what comes before/after a
              passage
            </li>
            <li>
              <strong>Word Connections:</strong> Match Greek/Hebrew words to their verses
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
