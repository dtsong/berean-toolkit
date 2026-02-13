/**
 * Sermon Notes API route
 * GET /api/sermon/notes - List all notes or get single note by id
 * POST /api/sermon/notes - Create new note
 * PATCH /api/sermon/notes - Update existing note
 * DELETE /api/sermon/notes - Delete note
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Database, Json } from '@/types/database';

type SermonNote = Database['public']['Tables']['sermon_notes']['Row'];
type SermonNoteInsert = Database['public']['Tables']['sermon_notes']['Insert'];

export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    // Fetch single note
    const { data: note, error } = await supabase
      .from('sermon_notes')
      .select()
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
      .overrideTypes<SermonNote, { merge: false }>();

    if (error || !note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json(note);
  }

  // List all notes
  const { data: notes, error } = await supabase
    .from('sermon_notes')
    .select()
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .overrideTypes<SermonNote[], { merge: false }>();

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }

  return NextResponse.json(notes);
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
    passage_reference: string;
    sermon_title?: string;
    sermon_date?: string;
    generated_outline?: Json;
    user_notes?: string;
    reflection_answers?: Json;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.passage_reference) {
    return NextResponse.json({ error: 'Passage reference is required' }, { status: 400 });
  }

  const newNote: SermonNoteInsert = {
    user_id: user.id,
    passage_reference: body.passage_reference,
    sermon_title: body.sermon_title ?? null,
    sermon_date: body.sermon_date ?? null,
    generated_outline: body.generated_outline ?? null,
    user_notes: body.user_notes ?? null,
    reflection_answers: body.reflection_answers ?? null,
  };

  const { data: note, error } = await supabase
    .from('sermon_notes')
    .insert(newNote)
    .select()
    .single()
    .overrideTypes<SermonNote, { merge: false }>();

  if (error) {
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }

  return NextResponse.json(note, { status: 201 });
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let body: {
    id: string;
    sermon_title?: string;
    sermon_date?: string;
    generated_outline?: Json;
    user_notes?: string;
    reflection_answers?: Json;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });
  }

  // Build updates object with only provided fields
  const updates: Partial<SermonNoteInsert> = {};

  if (body.sermon_title !== undefined) {
    updates.sermon_title = body.sermon_title;
  }
  if (body.sermon_date !== undefined) {
    updates.sermon_date = body.sermon_date;
  }
  if (body.generated_outline !== undefined) {
    updates.generated_outline = body.generated_outline;
  }
  if (body.user_notes !== undefined) {
    updates.user_notes = body.user_notes;
  }
  if (body.reflection_answers !== undefined) {
    updates.reflection_answers = body.reflection_answers;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const { data: note, error } = await supabase
    .from('sermon_notes')
    .update(updates)
    .eq('id', body.id)
    .eq('user_id', user.id)
    .select()
    .single()
    .overrideTypes<SermonNote, { merge: false }>();

  if (error || !note) {
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }

  return NextResponse.json(note);
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('sermon_notes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
