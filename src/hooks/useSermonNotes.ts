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
  reflectionAnswers?: Json | null;
}

interface UseSermonNotesReturn {
  notes: SermonNote[];
  currentNote: SermonNoteData | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  isAuthenticated: boolean;
  loadNotes: () => Promise<void>;
  loadNote: (id: string) => Promise<void>;
  createNote: (data: Omit<SermonNoteData, 'id'>) => Promise<string | null>;
  updateNote: (id: string, data: Partial<SermonNoteData>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  setCurrentNote: (note: SermonNoteData | null) => void;
  autoSaveReflection: (noteId: string, reflectionAnswers: Json) => void;
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
    reflectionAnswers: dbNote.reflection_answers,
  };
}

export function useSermonNotes(): UseSermonNotesReturn {
  const { user } = useAuth();
  const [notes, setNotes] = useState<SermonNote[]>([]);
  const [currentNote, setCurrentNote] = useState<SermonNoteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce timer ref for auto-save
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const pendingSave = useRef<{ noteId: string; reflectionAnswers: Json } | null>(null);

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
    setError(null);
    try {
      const response = await fetch('/api/sermon/notes');
      if (response.ok) {
        const data = (await response.json()) as SermonNote[];
        setNotes(data);
      } else {
        setError('Could not load saved notes. Please try again.');
      }
    } catch {
      setError('Could not load saved notes. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadNote = useCallback(
    async (id: string) => {
      if (!user) return;

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/sermon/notes?id=${id}`);
        if (response.ok) {
          const data = (await response.json()) as SermonNote;
          setCurrentNote(dbToLocal(data));
        } else {
          setError('Could not load this note. Please try again.');
        }
      } catch {
        setError('Could not load this note. Check your connection and try again.');
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
      setError(null);
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

        setError('Could not save this note. Please try again.');
      } catch {
        setError('Could not save this note. Check your connection and try again.');
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
      setError(null);
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
          // Use functional setState to avoid currentNote dependency
          setCurrentNote(prev => (prev?.id === id ? dbToLocal(updated) : prev));
        } else {
          setError('Could not save changes. Please try again.');
        }
      } catch {
        setError('Could not save changes. Check your connection and try again.');
      } finally {
        setSaving(false);
      }
    },
    [user] // Removed currentNote dependency - uses functional setState
  );

  const deleteNote = useCallback(
    async (id: string) => {
      if (!user) return;

      setSaving(true);
      setError(null);
      try {
        const response = await fetch(`/api/sermon/notes?id=${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setNotes(prev => prev.filter(n => n.id !== id));
          // Use functional setState to avoid currentNote dependency
          setCurrentNote(prev => (prev?.id === id ? null : prev));
        } else {
          setError('Could not delete this note. Please try again.');
        }
      } catch {
        setError('Could not delete this note. Check your connection and try again.');
      } finally {
        setSaving(false);
      }
    },
    [user] // Removed currentNote dependency - uses functional setState
  );

  // Debounced auto-save for reflection answers
  const autoSaveReflection = useCallback(
    (noteId: string, reflectionAnswers: Json) => {
      if (!user) return;

      // Store pending save
      pendingSave.current = { noteId, reflectionAnswers };

      // Clear existing timer
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }

      // Set new timer
      autoSaveTimer.current = setTimeout(() => {
        const pending = pendingSave.current;
        if (!pending) return;

        pendingSave.current = null;
        void updateNote(pending.noteId, { reflectionAnswers: pending.reflectionAnswers });
      }, DEBOUNCE_MS);
    },
    [user, updateNote]
  );

  return {
    notes,
    currentNote,
    loading,
    saving,
    error,
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
