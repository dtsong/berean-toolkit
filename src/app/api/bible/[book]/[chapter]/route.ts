import { NextResponse } from 'next/server';
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

// Book name mapping for API
const BOOK_CODES: Record<string, string> = {
  GEN: 'Genesis',
  EXO: 'Exodus',
  LEV: 'Leviticus',
  NUM: 'Numbers',
  DEU: 'Deuteronomy',
  JOS: 'Joshua',
  JDG: 'Judges',
  RUT: 'Ruth',
  '1SA': '1 Samuel',
  '2SA': '2 Samuel',
  '1KI': '1 Kings',
  '2KI': '2 Kings',
  '1CH': '1 Chronicles',
  '2CH': '2 Chronicles',
  EZR: 'Ezra',
  NEH: 'Nehemiah',
  EST: 'Esther',
  JOB: 'Job',
  PSA: 'Psalms',
  PRO: 'Proverbs',
  ECC: 'Ecclesiastes',
  SNG: 'Song of Solomon',
  ISA: 'Isaiah',
  JER: 'Jeremiah',
  LAM: 'Lamentations',
  EZK: 'Ezekiel',
  DAN: 'Daniel',
  HOS: 'Hosea',
  JOL: 'Joel',
  AMO: 'Amos',
  OBA: 'Obadiah',
  JON: 'Jonah',
  MIC: 'Micah',
  NAM: 'Nahum',
  HAB: 'Habakkuk',
  ZEP: 'Zephaniah',
  HAG: 'Haggai',
  ZEC: 'Zechariah',
  MAL: 'Malachi',
  MAT: 'Matthew',
  MRK: 'Mark',
  LUK: 'Luke',
  JHN: 'John',
  ACT: 'Acts',
  ROM: 'Romans',
  '1CO': '1 Corinthians',
  '2CO': '2 Corinthians',
  GAL: 'Galatians',
  EPH: 'Ephesians',
  PHP: 'Philippians',
  COL: 'Colossians',
  '1TH': '1 Thessalonians',
  '2TH': '2 Thessalonians',
  '1TI': '1 Timothy',
  '2TI': '2 Timothy',
  TIT: 'Titus',
  PHM: 'Philemon',
  HEB: 'Hebrews',
  JAS: 'James',
  '1PE': '1 Peter',
  '2PE': '2 Peter',
  '1JN': '1 John',
  '2JN': '2 John',
  '3JN': '3 John',
  JUD: 'Jude',
  REV: 'Revelation',
};

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
    bookName: BOOK_CODES[bookCode.toUpperCase()] || data.book.name,
    chapter: data.chapter.number,
    verses,
    translation: 'BSB',
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ book: string; chapter: string }> }
): Promise<NextResponse> {
  const { book, chapter } = await params;

  // Validate book code
  const bookCode = book.toUpperCase();
  if (!BOOK_CODES[bookCode]) {
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
          { error: `Chapter ${chapter} not found in ${BOOK_CODES[bookCode]}` },
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
