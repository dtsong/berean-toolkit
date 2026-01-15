/**
 * Reflection questions API route
 * POST /api/reflection
 * Body: { passage: string, count?: number }
 */

import { NextResponse, type NextRequest } from 'next/server';
import { generateReflectionQuestions } from '@/lib/llm';
import type { ReflectionQuestion } from '@/types';

interface RequestBody {
  passage: string;
  count?: number;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: RequestBody;

  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { passage, count = 5 } = body;

  if (passage == null || passage.trim() === '') {
    return NextResponse.json({ error: 'Missing passage parameter' }, { status: 400 });
  }

  try {
    const result = await generateReflectionQuestions(passage, count);

    if (result == null) {
      return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
    }

    // Map to typed ReflectionQuestion array with category validation
    const questions: ReflectionQuestion[] = result.map(q => ({
      question: q.question,
      category: (['observation', 'interpretation', 'application'].includes(q.category)
        ? q.category
        : 'observation') as ReflectionQuestion['category'],
    }));

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error generating reflection questions:', error);
    return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
  }
}
