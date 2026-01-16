/**
 * Hook for managing game progress
 * Syncs progress to database for authenticated users
 * Falls back to local state for anonymous users
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import type { Database } from '@/types/database';

type GameProgress = Database['public']['Tables']['game_progress']['Row'];
type GameMode = 'verse_detective' | 'context_clues' | 'word_connections';

interface ModeProgress {
  questionsAnswered: number;
  correctAnswers: number;
  currentStreak: number;
  bestStreak: number;
  lastPlayedAt: string | null;
}

interface UseGameProgressReturn {
  progress: Record<GameMode, ModeProgress>;
  loading: boolean;
  isAuthenticated: boolean;
  updateProgress: (mode: GameMode, update: Partial<ModeProgress>) => Promise<void>;
  recordAnswer: (mode: GameMode, correct: boolean) => Promise<void>;
}

const DEFAULT_PROGRESS: ModeProgress = {
  questionsAnswered: 0,
  correctAnswers: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastPlayedAt: null,
};

const LOCAL_STORAGE_KEY = 'berean_game_progress';

function getLocalProgress(): Record<GameMode, ModeProgress> {
  if (typeof window === 'undefined') {
    return {
      verse_detective: { ...DEFAULT_PROGRESS },
      context_clues: { ...DEFAULT_PROGRESS },
      word_connections: { ...DEFAULT_PROGRESS },
    };
  }

  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as Record<GameMode, ModeProgress>;
    }
  } catch {
    // Invalid stored data, use defaults
  }

  return {
    verse_detective: { ...DEFAULT_PROGRESS },
    context_clues: { ...DEFAULT_PROGRESS },
    word_connections: { ...DEFAULT_PROGRESS },
  };
}

function saveLocalProgress(progress: Record<GameMode, ModeProgress>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(progress));
}

function dbToLocal(dbProgress: GameProgress): ModeProgress {
  return {
    questionsAnswered: dbProgress.questions_answered,
    correctAnswers: dbProgress.correct_answers,
    currentStreak: dbProgress.current_streak,
    bestStreak: dbProgress.best_streak,
    lastPlayedAt: dbProgress.last_played_at,
  };
}

export function useGameProgress(): UseGameProgressReturn {
  const { user, loading: authLoading } = useAuth();
  const [progress, setProgress] = useState<Record<GameMode, ModeProgress>>(getLocalProgress);
  const [loading, setLoading] = useState(true);

  // Load progress from database when authenticated
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Not authenticated - use local storage
      setProgress(getLocalProgress());
      setLoading(false);
      return;
    }

    // Fetch from database
    const fetchProgress = async (): Promise<void> => {
      try {
        const response = await fetch('/api/game/progress');
        if (response.ok) {
          const dbProgress = (await response.json()) as GameProgress[];

          const newProgress: Record<GameMode, ModeProgress> = {
            verse_detective: { ...DEFAULT_PROGRESS },
            context_clues: { ...DEFAULT_PROGRESS },
            word_connections: { ...DEFAULT_PROGRESS },
          };

          for (const p of dbProgress) {
            const mode = p.mode as GameMode;
            if (mode in newProgress) {
              newProgress[mode] = dbToLocal(p);
            }
          }

          setProgress(newProgress);
        }
      } catch {
        // Fall back to local storage on error
        setProgress(getLocalProgress());
      } finally {
        setLoading(false);
      }
    };

    void fetchProgress();
  }, [user, authLoading]);

  const updateProgress = useCallback(
    async (mode: GameMode, update: Partial<ModeProgress>) => {
      setProgress(prev => {
        const newProgress = {
          ...prev,
          [mode]: {
            ...prev[mode],
            ...update,
            lastPlayedAt: new Date().toISOString(),
          },
        };

        // Save to local storage (fallback)
        saveLocalProgress(newProgress);

        return newProgress;
      });

      // Sync to database if authenticated
      if (user) {
        try {
          await fetch('/api/game/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mode,
              questions_answered: update.questionsAnswered,
              correct_answers: update.correctAnswers,
              current_streak: update.currentStreak,
              best_streak: update.bestStreak,
            }),
          });
        } catch {
          // Silently fail - local storage has the data
        }
      }
    },
    [user]
  );

  const recordAnswer = useCallback(
    async (mode: GameMode, correct: boolean) => {
      const current = progress[mode];
      const newStreak = correct ? current.currentStreak + 1 : 0;
      const newBestStreak = Math.max(current.bestStreak, newStreak);

      await updateProgress(mode, {
        questionsAnswered: current.questionsAnswered + 1,
        correctAnswers: current.correctAnswers + (correct ? 1 : 0),
        currentStreak: newStreak,
        bestStreak: newBestStreak,
      });
    },
    [progress, updateProgress]
  );

  return {
    progress,
    loading,
    isAuthenticated: !!user,
    updateProgress,
    recordAnswer,
  };
}
