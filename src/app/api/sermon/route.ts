/**
 * Sermon outline API route
 * POST /api/sermon
 * Body: { passage: string, title?: string }
 */

import { NextResponse, type NextRequest } from 'next/server';
import { generateSermonOutline } from '@/lib/llm';
import { rateLimiters, getClientIdentifier } from '@/lib/rate-limit';
import { getBsbPassageText, isValidBsbReference } from '@/lib/bsb-text';
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
    const bsb = getBsbPassageText(passage);
    if (!bsb) {
      return NextResponse.json(
        { error: 'Could not load BSB text for this passage reference' },
        { status: 400 }
      );
    }

    const result = await generateSermonOutline(passage, bsb.text, title);

    if (result == null) {
      return NextResponse.json({ error: 'Failed to generate outline' }, { status: 500 });
    }

    const validatedCrossRefs = result.crossReferences
      .filter(r => typeof r === 'string')
      .map(r => r.trim())
      .filter(r => r.length > 0)
      .filter(isValidBsbReference);

    const outline: SermonOutline = {
      title,
      passage,
      mainPoints: result.mainPoints.map(p => ({
        heading: p.heading,
        subPoints: p.subPoints,
      })),
      keyThemes: result.keyThemes,
      crossReferences: validatedCrossRefs,
    };

    return NextResponse.json(outline);
  } catch (error) {
    console.error('Error generating sermon outline:', error);
    return NextResponse.json({ error: 'Failed to generate outline' }, { status: 500 });
  }
}
