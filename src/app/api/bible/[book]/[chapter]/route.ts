import { NextResponse } from 'next/server';
import { rateLimiters, getClientIdentifier } from '@/lib/rate-limit';
import { getBookNameFromCode, isValidBookCode } from '@/lib/book-codes';
import type { BibleChapter, BibleVerse } from '@/types';

interface BSBVerseContent {
  type: 'text' | 'noteId';
  text?: string;
  noteId?: string;
}

interface BSBVerse {
  type: 'verse' | 'heading' | 'line_break';
  number?: number;
  content?: (string | BSBVerseContent)[];
  heading?: string;
}

interface BSBResponse {
  translation: {
    id: string;
    name: string;
    language: string;
  };
  book: {
    id: string;
    name: string;
  };
  chapter: {
    number: number;
    content: BSBVerse[];
  };
}

function extractVerseText(content: (string | BSBVerseContent)[]): string {
  return content
    .map(item => {
      if (typeof item === 'string') return item;
      if (item.type === 'text' && item.text) return item.text;
      return '';
    })
    .join('')
    .trim();
}

function transformBSBResponse(data: BSBResponse, bookCode: string): BibleChapter {
  const verses: BibleVerse[] = [];

  for (const item of data.chapter.content) {
    if (item.type === 'verse' && item.number && item.content) {
      verses.push({
        book: bookCode.toUpperCase(),
        chapter: data.chapter.number,
        verse: item.number,
        text: extractVerseText(item.content),
      });
    }
  }

  return {
    book: bookCode.toUpperCase(),
    bookName: getBookNameFromCode(bookCode) || data.book.name,
    chapter: data.chapter.number,
    verses,
    translation: 'BSB',
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ book: string; chapter: string }> }
): Promise<NextResponse> {
  const clientId = getClientIdentifier(request);
  const rateLimit = rateLimiters.bible.check(clientId);

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

  const { book, chapter } = await params;

  // Validate book code
  const bookCode = book.toUpperCase();
  if (!isValidBookCode(bookCode)) {
    return NextResponse.json({ error: `Invalid book code: ${book}` }, { status: 400 });
  }

  // Validate chapter number
  const chapterNum = parseInt(chapter, 10);
  if (isNaN(chapterNum) || chapterNum < 1) {
    return NextResponse.json({ error: `Invalid chapter number: ${chapter}` }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://bible.helloao.org/api/BSB/${bookCode}/${chapterNum}.json`,
      {
        headers: {
          Accept: 'application/json',
        },
        next: { revalidate: 86400 }, // Cache for 24 hours
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: `Chapter ${chapter} not found in ${getBookNameFromCode(bookCode) ?? bookCode}` },
          { status: 404 }
        );
      }
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = (await response.json()) as BSBResponse;
    const transformed = transformBSBResponse(data, bookCode);

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Failed to fetch Bible chapter:', error);
    return NextResponse.json({ error: 'Failed to fetch Bible data' }, { status: 500 });
  }
}
