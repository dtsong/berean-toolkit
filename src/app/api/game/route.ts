/**
 * Game API route for Berean Challenge
 * GET /api/game?mode=verse_detective&difficulty=easy
 */

import { NextResponse, type NextRequest } from 'next/server';
import { rateLimiters, getClientIdentifier } from '@/lib/rate-limit';
import { createClient } from '@/lib/supabase/server';
import questionsData from '@/data/questions.json';
import type { GameMode, Difficulty, Question } from '@/types';
import type { Database, Json } from '@/types/database';

interface QuestionData {
  id: string;
  mode: string;
  difficulty: string;
  verseReference: string;
  questionText: string;
  correctAnswer: string;
  incorrectAnswers: string[];
  strongsNumber?: string;
  explanation?: string;
}

type DbQuestionRow = Database['public']['Tables']['questions']['Row'];

function jsonToStringArray(value: Json): string[] | null {
  if (!Array.isArray(value)) return null;
  const out: string[] = [];
  for (const item of value) {
    if (typeof item !== 'string') return null;
    out.push(item);
  }
  return out;
}

function dbToQuestion(row: DbQuestionRow): Question | null {
  const incorrect = jsonToStringArray(row.incorrect_answers);
  if (incorrect == null) return null;

  return {
    id: row.id,
    mode: row.mode as GameMode,
    difficulty: row.difficulty as Difficulty,
    verseReference: row.verse_reference,
    questionText: row.question_text,
    correctAnswer: row.correct_answer,
    incorrectAnswers: incorrect,
    strongsNumber: row.strongs_number ?? undefined,
    explanation: row.explanation ?? undefined,
  };
}

async function fetchSupabaseQuestions(
  mode: GameMode | null,
  difficulty: Difficulty | null
): Promise<Question[] | null> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from('questions')
      .select(
        'id, mode, difficulty, verse_reference, question_text, correct_answer, incorrect_answers, strongs_number, explanation, verified, created_at'
      )
      .eq('verified', true);

    if (mode != null) {
      query = query.eq('mode', mode);
    }

    if (difficulty != null) {
      query = query.eq('difficulty', difficulty);
    }

    const { data, error } = await query.limit(500);
    if (error) return null;
    if (!data) return [];

    const out: Question[] = [];
    for (const row of data as DbQuestionRow[]) {
      const mapped = dbToQuestion(row);
      if (mapped) out.push(mapped);
    }
    return out;
  } catch {
    // Supabase not configured or unavailable
    return null;
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const clientId = getClientIdentifier(request);
  const rateLimit = rateLimiters.game.check(clientId);

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil(rateLimit.resetIn / 1000).toString(),
        },
      }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('mode') as GameMode | null;
  const difficulty = searchParams.get('difficulty') as Difficulty | null;

  const supabaseQuestions = await fetchSupabaseQuestions(mode, difficulty);

  if (supabaseQuestions != null) {
    if (supabaseQuestions.length === 0) {
      return NextResponse.json(
        { error: 'No questions available for selected criteria' },
        { status: 404 }
      );
    }

    const randomIndex = Math.floor(Math.random() * supabaseQuestions.length);
    const question = supabaseQuestions[randomIndex];
    if (!question) {
      return NextResponse.json({ error: 'No questions available' }, { status: 404 });
    }
    return NextResponse.json(question);
  }

  // JSON fallback (local development without Supabase)
  const questions = questionsData.questions as QuestionData[];

  let filtered = questions;
  if (mode != null) filtered = filtered.filter(q => q.mode === mode);
  if (difficulty != null) filtered = filtered.filter(q => q.difficulty === difficulty);

  if (filtered.length === 0) {
    return NextResponse.json(
      { error: 'No questions available for selected criteria' },
      { status: 404 }
    );
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  const questionData = filtered[randomIndex];

  if (questionData == null) {
    return NextResponse.json({ error: 'No questions available' }, { status: 404 });
  }

  return NextResponse.json({
    id: questionData.id,
    mode: questionData.mode as GameMode,
    difficulty: questionData.difficulty as Difficulty,
    verseReference: questionData.verseReference,
    questionText: questionData.questionText,
    correctAnswer: questionData.correctAnswer,
    incorrectAnswers: questionData.incorrectAnswers,
    strongsNumber: questionData.strongsNumber,
    explanation: questionData.explanation,
  } satisfies Question);
}
