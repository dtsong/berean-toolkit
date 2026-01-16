/**
 * OAuth callback handler
 * Exchanges auth code for session and creates profile if needed
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();

      // Create profile if it doesn't exist
      if (!existingProfile) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('profiles') as any).insert({
          id: data.user.id,
          display_name: data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? null,
          preferred_translation: 'ESV',
        });
      }

      return NextResponse.redirect(new URL(next, origin));
    }
  }

  // Return to login on error
  return NextResponse.redirect(new URL('/auth/login?error=callback_failed', origin));
}
