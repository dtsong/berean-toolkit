import { NextResponse } from 'next/server';
import hebrewLexicon from '@/data/strongs/hebrew.json';
import greekLexicon from '@/data/strongs/greek.json';

interface StrongsEntry {
  word: string;
  transliteration: string;
  pronunciation: string;
  definition: string;
  partOfSpeech: string;
}

type LexiconData = Record<string, StrongsEntry>;

const hebrewData = hebrewLexicon as LexiconData;
const greekData = greekLexicon as LexiconData;

function normalizeStrongsNumber(number: string): string {
  // Normalize to uppercase and ensure proper format (H1 -> H1, h1 -> H1, H0001 -> H1)
  const upper = number.toUpperCase();
  const match = upper.match(/^([HG])(\d+)$/);
  if (!match || !match[1] || !match[2]) return upper;

  const prefix = match[1];
  const digits = match[2];
  // Remove leading zeros for lookup
  return `${prefix}${parseInt(digits, 10)}`;
}

function formatStrongsNumber(number: string): string {
  // Format with leading zeros for display (H1 -> H0001)
  const upper = number.toUpperCase();
  const match = upper.match(/^([HG])(\d+)$/);
  if (!match || !match[1] || !match[2]) return upper;

  const prefix = match[1];
  const digits = match[2];
  return `${prefix}${digits.padStart(4, '0')}`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ number: string }> }
): Promise<NextResponse> {
  const { number } = await params;

  // Validate Strong's number format
  const normalizedNumber = normalizeStrongsNumber(number);
  if (!/^[HG]\d+$/.test(normalizedNumber)) {
    return NextResponse.json(
      { error: `Invalid Strong's number format: ${number}. Expected format: H1234 or G1234` },
      { status: 400 }
    );
  }

  const isHebrew = normalizedNumber.startsWith('H');
  const lexicon = isHebrew ? hebrewData : greekData;

  // Try to find the entry
  const entry = lexicon[normalizedNumber];

  if (!entry) {
    return NextResponse.json(
      {
        error: `Strong's number ${number} not found`,
        suggestion: isHebrew
          ? 'Hebrew entries range from H1 to H8674'
          : 'Greek entries range from G1 to G5624',
      },
      { status: 404 }
    );
  }

  // Return the entry with additional metadata
  // Include `lemma` as an alias for `word` for compatibility with StrongsEntry type
  return NextResponse.json({
    number: formatStrongsNumber(normalizedNumber),
    lemma: entry.word, // Alias for compatibility
    language: isHebrew ? 'Hebrew' : 'Greek',
    ...entry,
  });
}
