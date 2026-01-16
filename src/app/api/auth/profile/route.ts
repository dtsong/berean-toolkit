/**
 * Profile API route
 * GET /api/auth/profile - Fetch current user's profile
 * PATCH /api/auth/profile - Update profile
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export async function GET(): Promise<NextResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  return NextResponse.json(profile);
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let body: { display_name?: string; preferred_translation?: string };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Only allow updating specific fields
  const updates: ProfileUpdate = {};

  if (body.display_name !== undefined) {
    updates.display_name = body.display_name;
  }

  if (body.preferred_translation !== undefined) {
    // Validate translation value
    const validTranslations = ['ESV', 'NIV', 'BSB', 'KJV', 'NASB', 'LSB'];
    if (!validTranslations.includes(body.preferred_translation)) {
      return NextResponse.json({ error: 'Invalid translation' }, { status: 400 });
    }
    updates.preferred_translation = body.preferred_translation;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile, error } = await (supabase.from('profiles') as any)
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }

  return NextResponse.json(profile);
}
