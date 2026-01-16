/**
 * Game API route for Berean Challenge
 * GET /api/game?mode=verse_detective&difficulty=easy
 */

import { NextResponse, type NextRequest } from 'next/server';
import { rateLimiters, getClientIdentifier } from '@/lib/rate-limit';
import questionsData from '@/data/questions.json';
import type { GameMode, Difficulty, Question } from '@/types';

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

  const questions = questionsData.questions as QuestionData[];

  // Filter questions by mode and difficulty
  let filtered = questions;

  if (mode != null) {
    filtered = filtered.filter(q => q.mode === mode);
  }

  if (difficulty != null) {
    filtered = filtered.filter(q => q.difficulty === difficulty);
  }

  if (filtered.length === 0) {
    return NextResponse.json(
      { error: 'No questions available for selected criteria' },
      { status: 404 }
    );
  }

  // Return a random question
  const randomIndex = Math.floor(Math.random() * filtered.length);
  const questionData = filtered[randomIndex];

  if (questionData == null) {
    return NextResponse.json({ error: 'No questions available' }, { status: 404 });
  }

  const question: Question = {
    id: questionData.id,
    mode: questionData.mode as GameMode,
    difficulty: questionData.difficulty as Difficulty,
    verseReference: questionData.verseReference,
    questionText: questionData.questionText,
    correctAnswer: questionData.correctAnswer,
    incorrectAnswers: questionData.incorrectAnswers,
    strongsNumber: questionData.strongsNumber,
    explanation: questionData.explanation,
  };

  return NextResponse.json(question);
}
