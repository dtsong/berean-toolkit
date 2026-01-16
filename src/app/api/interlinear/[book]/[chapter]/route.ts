import { NextResponse } from 'next/server';
import { rateLimiters, getClientIdentifier } from '@/lib/rate-limit';
import type { InterlinearChapter, InterlinearVerse } from '@/types';

interface BookData {
  book: string;
  chapters: Record<string, Record<string, unknown[]>>;
}

async function loadBookData(bookCode: string): Promise<BookData | null> {
  try {
    const data = await import(`@/data/bsb/${bookCode}.json`);
    return data.default as BookData;
  } catch {
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ book: string; chapter: string }> }
): Promise<NextResponse> {
  const clientId = getClientIdentifier(request);
  const rateLimit = rateLimiters.interlinear.check(clientId);

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
  const bookCode = book.toUpperCase();
  const chapterNum = parseInt(chapter, 10);

  if (isNaN(chapterNum) || chapterNum < 1) {
    return NextResponse.json({ error: 'Invalid chapter number' }, { status: 400 });
  }

  const bookData = await loadBookData(bookCode);

  if (!bookData) {
    return NextResponse.json(
      { error: `Book not found: ${bookCode}. Use 3-letter codes like GEN, JHN, ROM.` },
      { status: 404 }
    );
  }

  const chapterData = bookData.chapters[chapterNum.toString()];

  if (!chapterData) {
    return NextResponse.json(
      { error: `Chapter ${chapterNum} not found in ${bookCode}` },
      { status: 404 }
    );
  }

  // Check for verse query param
  const url = new URL(request.url);
  const verseParam = url.searchParams.get('verse');

  if (verseParam) {
    const verseNum = parseInt(verseParam, 10);
    const words = chapterData[verseNum.toString()];

    if (!words) {
      return NextResponse.json(
        { error: `Verse ${verseNum} not found in ${bookCode} ${chapterNum}` },
        { status: 404 }
      );
    }

    const verse: InterlinearVerse = {
      book: bookCode,
      chapter: chapterNum,
      verse: verseNum,
      words: words as InterlinearVerse['words'],
    };

    const response: InterlinearChapter = {
      book: bookCode,
      chapter: chapterNum,
      verses: [verse],
    };

    return NextResponse.json(response);
  }

  // Return full chapter
  const verses: InterlinearVerse[] = [];

  for (const [verseNum, words] of Object.entries(chapterData)) {
    verses.push({
      book: bookCode,
      chapter: chapterNum,
      verse: parseInt(verseNum, 10),
      words: words as InterlinearVerse['words'],
    });
  }

  verses.sort((a, b) => a.verse - b.verse);

  const response: InterlinearChapter = {
    book: bookCode,
    chapter: chapterNum,
    verses,
  };

  return NextResponse.json(response);
}
