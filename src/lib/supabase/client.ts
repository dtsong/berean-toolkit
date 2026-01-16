/**
 * Supabase browser client
 * For use in client components
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export function createClient(): ReturnType<typeof createBrowserClient<Database>> | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl == null || supabaseAnonKey == null) {
    // Return null during build/SSR when env vars aren't available
    return null;
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
