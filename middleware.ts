/**
 * Next.js middleware for Supabase session refresh
 * Runs on every request to keep auth sessions active
 */

import { updateSession } from '@/lib/supabase/middleware';
import { type NextRequest, type NextResponse } from 'next/server';

export async function middleware(request: NextRequest): Promise<NextResponse> {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static assets (.svg, .png, .jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
