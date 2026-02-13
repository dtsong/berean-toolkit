'use client';

import { useEffect, useMemo, useState } from 'react';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { Alert } from '@/components/Alert';
import { SermonOutline } from '@/components/SermonOutline';
import { ReflectionQuestions } from '@/components/ReflectionQuestions';
import { useSermonNotes } from '@/hooks/useSermonNotes';
import type { Json } from '@/types/database';
import type { SermonOutline as SermonOutlineType, ReflectionQuestion } from '@/types';

type SavedReflectionPayload = {
  questions?: ReflectionQuestion[];
  answers?: Record<string, string>;
};

function isSavedReflectionPayload(value: unknown): value is SavedReflectionPayload {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) return false;
  return true;
}

export default function SermonCompanionPage(): React.ReactElement {
  const [passage, setPassage] = useState('');
  const [title, setTitle] = useState('');
  const [outline, setOutline] = useState<SermonOutlineType | null>(null);
  const [loading, setLoading] = useState(false);
  const [outlineError, setOutlineError] = useState<string | null>(null);
  const [reflectionError, setReflectionError] = useState<string | null>(null);

  const {
    notes,
    currentNote,
    loading: notesLoading,
    saving: notesSaving,
    error: notesError,
    isAuthenticated,
    loadNotes,
    loadNote,
    createNote,
    updateNote,
    setCurrentNote,
    autoSaveReflection,
  } = useSermonNotes();

  // Reflection questions state
  const [reflectionQuestions, setReflectionQuestions] = useState<ReflectionQuestion[] | null>(null);
  const [reflectionLoading, setReflectionLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  // Option to generate both in parallel
  const [includeReflection, setIncludeReflection] = useState(true);

  // Load saved notes once authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    void loadNotes();
  }, [isAuthenticated, loadNotes]);

  // When a note is loaded/created, hydrate local UI state
  useEffect(() => {
    if (!isAuthenticated || currentNote == null) return;

    setPassage(currentNote.passageReference);
    setTitle(currentNote.sermonTitle ?? '');

    if (currentNote.generatedOutline != null) {
      setOutline(currentNote.generatedOutline as unknown as SermonOutlineType);
    }

    const reflection = currentNote.reflectionAnswers;
    if (isSavedReflectionPayload(reflection)) {
      if (Array.isArray(reflection.questions)) {
        setReflectionQuestions(reflection.questions);
      }

      if (reflection.answers && typeof reflection.answers === 'object') {
        const parsed: Record<number, string> = {};
        for (const [key, value] of Object.entries(reflection.answers)) {
          const index = Number(key);
          if (!Number.isNaN(index) && typeof value === 'string') {
            parsed[index] = value;
          }
        }
        setAnswers(parsed);
      }
    }
  }, [currentNote, isAuthenticated]);

  const reflectionSavePayload = useMemo(() => {
    if (reflectionQuestions == null && Object.keys(answers).length === 0) return null;

    const serializedAnswers: Record<string, string> = {};
    for (const [key, value] of Object.entries(answers)) {
      serializedAnswers[key] = value;
    }

    return {
      questions: reflectionQuestions ?? undefined,
      answers: serializedAnswers,
    } satisfies SavedReflectionPayload;
  }, [answers, reflectionQuestions]);

  // Debounced auto-save for reflection answers/questions
  useEffect(() => {
    if (!isAuthenticated) return;
    if (currentNote?.id == null) return;
    if (reflectionSavePayload == null) return;
    autoSaveReflection(currentNote.id, reflectionSavePayload as unknown as Json);
  }, [autoSaveReflection, currentNote?.id, isAuthenticated, reflectionSavePayload]);

  const persistGeneratedOutline = async (generated: SermonOutlineType): Promise<void> => {
    if (!isAuthenticated) return;

    const trimmedPassage = passage.trim();
    if (trimmedPassage === '') return;

    const trimmedTitle = title.trim();
    const sermonTitle = trimmedTitle === '' ? null : trimmedTitle;

    // If we already have a note for this passage, update it.
    if (currentNote?.id && currentNote.passageReference === trimmedPassage) {
      await updateNote(currentNote.id, {
        sermonTitle,
        generatedOutline: generated as unknown as Json,
      });
      return;
    }

    // Otherwise, create a new note tied to this passage.
    await createNote({
      passageReference: trimmedPassage,
      sermonTitle,
      sermonDate: null,
      generatedOutline: generated as unknown as Json,
      userNotes: null,
      reflectionAnswers: (reflectionSavePayload as unknown as Json) ?? null,
    });
  };

  // Generate both outline and questions in parallel (eliminates waterfall)
  const generateBoth = async (): Promise<void> => {
    setLoading(true);
    setReflectionLoading(true);
    setOutlineError(null);
    setReflectionError(null);

    const outlinePromise = fetch('/api/sermon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passage, title: title.trim() !== '' ? title : undefined }),
    });

    const questionsPromise = fetch('/api/reflection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passage }),
    });

    try {
      const [outlineRes, questionsRes] = await Promise.all([outlinePromise, questionsPromise]);

      if (outlineRes.ok) {
        const outlineData = (await outlineRes.json()) as SermonOutlineType;
        setOutline(outlineData);
        await persistGeneratedOutline(outlineData);
      } else {
        setOutlineError('Could not generate an outline. Please try again.');
      }

      if (questionsRes.ok) {
        const questionsData = (await questionsRes.json()) as { questions: ReflectionQuestion[] };
        setReflectionQuestions(questionsData.questions);
      } else {
        setReflectionError('Could not generate reflection questions. Please try again.');
      }
    } catch {
      setOutlineError('Could not generate content. Check your connection and try again.');
      setReflectionError('Could not generate content. Check your connection and try again.');
    } finally {
      setLoading(false);
      setReflectionLoading(false);
    }
  };

  const generateOutlineOnly = async (): Promise<void> => {
    setLoading(true);
    setOutlineError(null);
    try {
      const response = await fetch('/api/sermon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passage, title: title.trim() !== '' ? title : undefined }),
      });

      if (response.ok) {
        const data = (await response.json()) as SermonOutlineType;
        setOutline(data);
        await persistGeneratedOutline(data);
      } else {
        setOutlineError('Could not generate an outline. Please try again.');
      }
    } catch {
      setOutlineError('Could not generate an outline. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = (e: React.FormEvent): void => {
    e.preventDefault();
    if (passage.trim() === '') return;
    // Reset state
    setReflectionQuestions(null);
    setAnswers({});
    setOutlineError(null);
    setReflectionError(null);
    // Generate in parallel if checkbox is checked, otherwise just outline
    if (includeReflection) {
      void generateBoth();
    } else {
      void generateOutlineOnly();
    }
  };

  const generateQuestions = async (): Promise<void> => {
    setReflectionLoading(true);
    setReflectionError(null);
    try {
      const response = await fetch('/api/reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passage }),
      });

      if (response.ok) {
        const data = (await response.json()) as { questions: ReflectionQuestion[] };
        setReflectionQuestions(data.questions);
      } else {
        setReflectionError('Could not generate reflection questions. Please try again.');
      }
    } catch {
      setReflectionError(
        'Could not generate reflection questions. Check your connection and try again.'
      );
    } finally {
      setReflectionLoading(false);
    }
  };

  const handleAnswerChange = (index: number, answer: string): void => {
    setAnswers(prev => ({ ...prev, [index]: answer }));
  };

  const resetToNewNote = (): void => {
    setCurrentNote(null);
    setOutline(null);
    setReflectionQuestions(null);
    setAnswers({});
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <AuthHeader title="Sermon Companion" />

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Input Form */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Sermon Details
            </h2>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label
                  htmlFor="passage"
                  className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Passage Reference *
                </label>
                <input
                  id="passage"
                  type="text"
                  value={passage}
                  onChange={e => setPassage(e.target.value)}
                  placeholder="e.g., Romans 8:28-39"
                  className="w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="title"
                  className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Sermon Title (optional)
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g., God's Unfailing Love"
                  className="w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="includeReflection"
                  type="checkbox"
                  checked={includeReflection}
                  onChange={e => setIncludeReflection(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 text-purple-600 focus:ring-purple-500 dark:border-zinc-600 dark:bg-zinc-800"
                />
                <label
                  htmlFor="includeReflection"
                  className="text-sm text-zinc-700 dark:text-zinc-300"
                >
                  Include reflection questions
                </label>
              </div>
              <button
                type="submit"
                disabled={loading || reflectionLoading}
                className="w-full rounded-lg bg-purple-600 px-6 py-2 font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
              >
                {loading || reflectionLoading
                  ? 'Generating…'
                  : includeReflection
                    ? 'Generate Outline & Questions'
                    : 'Generate Outline'}
              </button>

              {outlineError && (
                <Alert
                  variant="error"
                  title="Outline generation failed"
                  description={outlineError}
                  actionLabel="Retry"
                  onAction={() => {
                    if (includeReflection) {
                      void generateBoth();
                    } else {
                      void generateOutlineOnly();
                    }
                  }}
                  onDismiss={() => setOutlineError(null)}
                />
              )}

              {reflectionError && includeReflection && (
                <Alert
                  variant="warning"
                  title="Reflection question generation failed"
                  description={reflectionError}
                  actionLabel="Retry"
                  onAction={() => void generateQuestions()}
                  onDismiss={() => setReflectionError(null)}
                />
              )}
            </form>

            {/* Tips */}
            <div className="mt-6 rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
              <h3 className="mb-2 font-medium text-purple-900 dark:text-purple-100">
                Tips for Use
              </h3>
              <ul className="space-y-1 text-sm text-purple-800 dark:text-purple-200">
                <li>• Enter the passage before the sermon to prepare</li>
                <li>• The outline is suggested — the actual sermon may differ</li>
                <li>• Use the outline as a starting point for notes</li>
              </ul>
            </div>

            <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  My Saved Notes
                </h3>
                {isAuthenticated && currentNote?.id != null && (
                  <button
                    type="button"
                    onClick={resetToNewNote}
                    className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                  >
                    New
                  </button>
                )}
              </div>

              {!isAuthenticated ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Sign in to save outlines and reflection answers.
                </p>
              ) : notesError ? (
                <Alert
                  variant="error"
                  title="Could not load notes"
                  description={notesError}
                  actionLabel="Retry"
                  onAction={() => void loadNotes()}
                />
              ) : notesLoading ? (
                <div className="space-y-2">
                  <div className="h-4 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                  <div className="h-4 w-56 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                  <div className="h-4 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                </div>
              ) : notes.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  No saved notes yet. Generate an outline to start saving.
                </p>
              ) : (
                <div className="space-y-2">
                  {notes.slice(0, 8).map(note => (
                    <button
                      key={note.id}
                      type="button"
                      onClick={() => void loadNote(note.id)}
                      className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                        currentNote?.id === note.id
                          ? 'border-purple-300 bg-purple-50 dark:border-purple-700 dark:bg-purple-900/20'
                          : 'border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {note.passage_reference}
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          {note.sermon_date ?? note.created_at.slice(0, 10)}
                        </span>
                      </div>
                      {note.sermon_title && (
                        <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          {note.sermon_title}
                        </div>
                      )}
                    </button>
                  ))}

                  {notesSaving && (
                    <p className="pt-1 text-xs text-zinc-500 dark:text-zinc-400">Saving…</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Outline Display */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Suggested Outline
            </h2>
            <SermonOutline outline={outline} loading={loading} />
          </div>
        </div>

        {/* Reflection Questions Section - shows after outline is generated */}
        {outline != null && (
          <div className="mt-8 border-t border-zinc-200 pt-8 dark:border-zinc-800">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Reflection Questions
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Deepen your understanding with guided questions
                </p>
              </div>
              {reflectionQuestions == null && !reflectionLoading && (
                <button
                  type="button"
                  onClick={() => void generateQuestions()}
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
                >
                  Generate Questions
                </button>
              )}
            </div>

            {reflectionError && (
              <Alert
                variant="warning"
                title="Could not load reflection questions"
                description={reflectionError}
                actionLabel="Retry"
                onAction={() => void generateQuestions()}
                onDismiss={() => setReflectionError(null)}
              />
            )}
            <ReflectionQuestions
              questions={reflectionQuestions}
              loading={reflectionLoading}
              answers={answers}
              onAnswerChange={handleAnswerChange}
            />
          </div>
        )}
      </main>
    </div>
  );
}
