/**
 * Game Progress API route
 * GET /api/game/progress - Fetch all progress for authenticated user
 * POST /api/game/progress - Upsert progress for a specific mode
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

type GameProgress = Database['public']['Tables']['game_progress']['Row'];
type GameProgressInsert = Database['public']['Tables']['game_progress']['Insert'];

export async function GET(): Promise<NextResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: progress, error } = await (supabase.from('game_progress') as any)
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }

  return NextResponse.json(progress as GameProgress[]);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let body: {
    mode: string;
    questions_answered?: number;
    correct_answers?: number;
    current_streak?: number;
    best_streak?: number;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.mode) {
    return NextResponse.json({ error: 'Mode is required' }, { status: 400 });
  }

  // Validate mode
  const validModes = ['verse_detective', 'context_clues', 'word_connections'];
  if (!validModes.includes(body.mode)) {
    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
  }

  // Check if progress exists for this mode
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase.from('game_progress') as any)
    .select('id')
    .eq('user_id', user.id)
    .eq('mode', body.mode)
    .single();

  let progress: GameProgress | null = null;
  let error: unknown = null;

  if (existing) {
    // Update existing progress
    const updates: Partial<GameProgressInsert> = {
      last_played_at: new Date().toISOString(),
    };

    if (body.questions_answered !== undefined) {
      updates.questions_answered = body.questions_answered;
    }
    if (body.correct_answers !== undefined) {
      updates.correct_answers = body.correct_answers;
    }
    if (body.current_streak !== undefined) {
      updates.current_streak = body.current_streak;
    }
    if (body.best_streak !== undefined) {
      updates.best_streak = body.best_streak;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (supabase.from('game_progress') as any)
      .update(updates)
      .eq('id', existing.id)
      .select()
      .single();

    progress = result.data;
    error = result.error;
  } else {
    // Insert new progress
    const newProgress: GameProgressInsert = {
      user_id: user.id,
      mode: body.mode,
      questions_answered: body.questions_answered ?? 0,
      correct_answers: body.correct_answers ?? 0,
      current_streak: body.current_streak ?? 0,
      best_streak: body.best_streak ?? 0,
      last_played_at: new Date().toISOString(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (supabase.from('game_progress') as any)
      .insert(newProgress)
      .select()
      .single();

    progress = result.data;
    error = result.error;
  }

  if (error) {
    return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
  }

  return NextResponse.json(progress);
}
