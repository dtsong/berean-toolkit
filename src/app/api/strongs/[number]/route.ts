import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimiters, getClientIdentifier } from '@/lib/rate-limit';
import hebrewLexicon from '@/data/strongs/hebrew.json';
import greekLexicon from '@/data/strongs/greek.json';
import type { Database } from '@/types/database';

interface StrongsEntry {
  word: string;
  transliteration: string;
  pronunciation: string;
  definition: string;
  partOfSpeech: string;
}

type StrongsDBEntry = Database['public']['Tables']['strongs_entries']['Row'];

type LexiconData = Record<string, StrongsEntry>;

const hebrewData = hebrewLexicon as LexiconData;
const greekData = greekLexicon as LexiconData;

function formatStrongsNumber(number: string): string {
  const upper = number.toUpperCase();
  const match = upper.match(/^([HG])(\d+)$/);
  if (!match || !match[1] || !match[2]) return upper;

  const prefix = match[1];
  const digits = match[2];
  return `${prefix}${digits.padStart(4, '0')}`;
}

function normalizeForLocalLookup(number: string): string {
  const upper = number.toUpperCase();
  const match = upper.match(/^([HG])(\d+)$/);
  if (!match || !match[1] || !match[2]) return upper;

  const prefix = match[1];
  const digits = match[2];
  return `${prefix}${parseInt(digits, 10)}`;
}

async function fetchFromSupabase(formattedNumber: string): Promise<StrongsDBEntry | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('strongs_entries')
      .select()
      .eq('number', formattedNumber)
      .maybeSingle()
      .overrideTypes<StrongsDBEntry, { merge: false }>();

    if (error || !data) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

function fetchFromLocalJSON(normalizedNumber: string): StrongsEntry | null {
  const isHebrew = normalizedNumber.startsWith('H');
  const lexicon = isHebrew ? hebrewData : greekData;
  return lexicon[normalizedNumber] || null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ number: string }> }
): Promise<NextResponse> {
  const clientId = getClientIdentifier(request);
  const rateLimit = rateLimiters.strongs.check(clientId);

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

  const { number } = await params;

  const upper = number.toUpperCase();
  if (!/^[HG]\d+$/.test(upper)) {
    return NextResponse.json(
      { error: `Invalid Strong's number format: ${number}. Expected format: H1234 or G1234` },
      { status: 400 }
    );
  }

  const formattedNumber = formatStrongsNumber(upper);
  const isHebrew = upper.startsWith('H');

  // Try Supabase first (has complete 14K+ entries)
  const dbEntry = await fetchFromSupabase(formattedNumber);

  if (dbEntry) {
    return NextResponse.json({
      number: dbEntry.number,
      lemma: dbEntry.lemma,
      language: dbEntry.language === 'hebrew' ? 'Hebrew' : 'Greek',
      word: dbEntry.lemma,
      transliteration: dbEntry.transliteration,
      pronunciation: dbEntry.pronunciation || '',
      definition: dbEntry.definition,
      partOfSpeech: dbEntry.part_of_speech || '',
      kjvUsage: dbEntry.kjv_usage,
    });
  }

  // Fallback to local JSON (limited ~350 entries)
  const normalizedNumber = normalizeForLocalLookup(upper);
  const localEntry = fetchFromLocalJSON(normalizedNumber);

  if (localEntry) {
    return NextResponse.json({
      number: formattedNumber,
      lemma: localEntry.word,
      language: isHebrew ? 'Hebrew' : 'Greek',
      ...localEntry,
    });
  }

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
