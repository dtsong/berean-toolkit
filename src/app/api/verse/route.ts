/**
 * Verse lookup API route
 * GET /api/verse?reference=John+3:16&translation=ESV
 */

import { NextResponse, type NextRequest } from 'next/server';
import { parseVerseReference } from '@/lib/verse-parser';
import { fetchVerse } from '@/lib/bible-api';
import { rateLimiters, getClientIdentifier } from '@/lib/rate-limit';
import type { Translation } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const clientId = getClientIdentifier(request);
  const rateLimit = rateLimiters.verse.check(clientId);

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
  const reference = searchParams.get('reference');
  const translation = (searchParams.get('translation') ?? 'ESV') as Translation;

  if (reference == null || reference.trim() === '') {
    return NextResponse.json({ error: 'Missing reference parameter' }, { status: 400 });
  }

  const parsed = parseVerseReference(reference);
  if (parsed == null) {
    return NextResponse.json(
      { error: 'Invalid verse reference format. Try "John 3:16" or "Romans 8:28-30"' },
      { status: 400 }
    );
  }

  try {
    const verse = await fetchVerse(parsed, translation);
    if (verse == null) {
      return NextResponse.json({ error: 'Verse not found' }, { status: 404 });
    }
    return NextResponse.json(verse);
  } catch (error) {
    console.error('Error fetching verse:', error);
    return NextResponse.json({ error: 'Failed to fetch verse' }, { status: 500 });
  }
}
