/**
 * Sermon outline API route
 * POST /api/sermon
 * Body: { passage: string, title?: string }
 */

import { NextResponse, type NextRequest } from 'next/server';
import { generateSermonOutline } from '@/lib/llm';
import { rateLimiters, getClientIdentifier } from '@/lib/rate-limit';
import type { SermonOutline } from '@/types';

interface RequestBody {
  passage: string;
  title?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const clientId = getClientIdentifier(request);
  const rateLimit = rateLimiters.sermon.check(clientId);

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil(rateLimit.resetIn / 1000).toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(rateLimit.resetIn / 1000).toString(),
        },
      }
    );
  }

  let body: RequestBody;

  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { passage, title } = body;

  if (passage == null || passage.trim() === '') {
    return NextResponse.json({ error: 'Missing passage parameter' }, { status: 400 });
  }

  try {
    const result = await generateSermonOutline(passage, title);

    if (result == null) {
      return NextResponse.json({ error: 'Failed to generate outline' }, { status: 500 });
    }

    const outline: SermonOutline = {
      title,
      passage,
      mainPoints: result.mainPoints.map(p => ({
        heading: p.heading,
        subPoints: p.subPoints,
      })),
      keyThemes: result.keyThemes,
      crossReferences: result.crossReferences,
    };

    return NextResponse.json(outline);
  } catch (error) {
    console.error('Error generating sermon outline:', error);
    return NextResponse.json({ error: 'Failed to generate outline' }, { status: 500 });
  }
}
