/**
 * Hook for managing sermon notes
 * Syncs notes to database for authenticated users
 * Provides auto-save functionality with debouncing
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';
import type { Database, Json } from '@/types/database';

type SermonNote = Database['public']['Tables']['sermon_notes']['Row'];

export interface SermonNoteData {
  id?: string;
  passageReference: string;
  sermonTitle?: string | null;
  sermonDate?: string | null;
  generatedOutline?: Json | null;
  userNotes?: string | null;
  reflectionAnswers?: Record<string, string> | null;
}

interface UseSermonNotesReturn {
  notes: SermonNote[];
  currentNote: SermonNoteData | null;
  loading: boolean;
  saving: boolean;
  isAuthenticated: boolean;
  loadNotes: () => Promise<void>;
  loadNote: (id: string) => Promise<void>;
  createNote: (data: Omit<SermonNoteData, 'id'>) => Promise<string | null>;
  updateNote: (id: string, data: Partial<SermonNoteData>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  setCurrentNote: (note: SermonNoteData | null) => void;
  autoSaveReflection: (noteId: string, answers: Record<string, string>) => void;
}

const DEBOUNCE_MS = 1500;

function dbToLocal(dbNote: SermonNote): SermonNoteData {
  return {
    id: dbNote.id,
    passageReference: dbNote.passage_reference,
    sermonTitle: dbNote.sermon_title,
    sermonDate: dbNote.sermon_date,
    generatedOutline: dbNote.generated_outline,
    userNotes: dbNote.user_notes,
    reflectionAnswers: dbNote.reflection_answers as Record<string, string> | null,
  };
}

export function useSermonNotes(): UseSermonNotesReturn {
  const { user } = useAuth();
  const [notes, setNotes] = useState<SermonNote[]>([]);
  const [currentNote, setCurrentNote] = useState<SermonNoteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Debounce timer ref for auto-save
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const pendingSave = useRef<{ noteId: string; answers: Record<string, string> } | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, []);

  const loadNotes = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch('/api/sermon/notes');
      if (response.ok) {
        const data = (await response.json()) as SermonNote[];
        setNotes(data);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadNote = useCallback(
    async (id: string) => {
      if (!user) return;

      setLoading(true);
      try {
        const response = await fetch(`/api/sermon/notes?id=${id}`);
        if (response.ok) {
          const data = (await response.json()) as SermonNote;
          setCurrentNote(dbToLocal(data));
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const createNote = useCallback(
    async (data: Omit<SermonNoteData, 'id'>): Promise<string | null> => {
      if (!user) return null;

      setSaving(true);
      try {
        const response = await fetch('/api/sermon/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            passage_reference: data.passageReference,
            sermon_title: data.sermonTitle,
            sermon_date: data.sermonDate,
            generated_outline: data.generatedOutline,
            user_notes: data.userNotes,
            reflection_answers: data.reflectionAnswers,
          }),
        });

        if (response.ok) {
          const newNote = (await response.json()) as SermonNote;
          setNotes(prev => [newNote, ...prev]);
          setCurrentNote(dbToLocal(newNote));
          return newNote.id;
        }
      } catch {
        // Silently fail
      } finally {
        setSaving(false);
      }
      return null;
    },
    [user]
  );

  const updateNote = useCallback(
    async (id: string, data: Partial<SermonNoteData>) => {
      if (!user) return;

      setSaving(true);
      try {
        const response = await fetch('/api/sermon/notes', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            sermon_title: data.sermonTitle,
            sermon_date: data.sermonDate,
            generated_outline: data.generatedOutline,
            user_notes: data.userNotes,
            reflection_answers: data.reflectionAnswers,
          }),
        });

        if (response.ok) {
          const updated = (await response.json()) as SermonNote;
          setNotes(prev => prev.map(n => (n.id === id ? updated : n)));
          if (currentNote?.id === id) {
            setCurrentNote(dbToLocal(updated));
          }
        }
      } catch {
        // Silently fail
      } finally {
        setSaving(false);
      }
    },
    [user, currentNote]
  );

  const deleteNote = useCallback(
    async (id: string) => {
      if (!user) return;

      setSaving(true);
      try {
        const response = await fetch(`/api/sermon/notes?id=${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setNotes(prev => prev.filter(n => n.id !== id));
          if (currentNote?.id === id) {
            setCurrentNote(null);
          }
        }
      } catch {
        // Silently fail
      } finally {
        setSaving(false);
      }
    },
    [user, currentNote]
  );

  // Debounced auto-save for reflection answers
  const autoSaveReflection = useCallback(
    (noteId: string, answers: Record<string, string>) => {
      if (!user) return;

      // Store pending save
      pendingSave.current = { noteId, answers };

      // Clear existing timer
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }

      // Set new timer
      autoSaveTimer.current = setTimeout(() => {
        const pending = pendingSave.current;
        if (!pending) return;

        pendingSave.current = null;
        void updateNote(pending.noteId, { reflectionAnswers: pending.answers });
      }, DEBOUNCE_MS);
    },
    [user, updateNote]
  );

  return {
    notes,
    currentNote,
    loading,
    saving,
    isAuthenticated: !!user,
    loadNotes,
    loadNote,
    createNote,
    updateNote,
    deleteNote,
    setCurrentNote,
    autoSaveReflection,
  };
}
