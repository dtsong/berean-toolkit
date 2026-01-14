/**
 * Bible API client for fetching verse text from various sources
 * Supports ESV, NIV, BSB and other translations via their respective APIs
 */

import type { VerseReference, VerseData, Translation } from '@/types';
import { formatVerseReference } from './verse-parser';
import { getBookCode } from './bible';

interface ESVResponse {
  passages: string[];
  canonical: string;
}

interface BibleAPIResponse {
  data: {
    content: string;
    reference: string;
  };
}

/**
 * Fetch verse text from ESV API
 * Requires ESV_API_KEY environment variable
 */
export async function fetchESVVerse(reference: VerseReference): Promise<VerseData | null> {
  const apiKey = process.env.ESV_API_KEY;
  if (apiKey == null) {
    console.error('ESV_API_KEY not configured');
    return null;
  }

  const refString = formatVerseReference(reference);
  const url = new URL('https://api.esv.org/v3/passage/text/');
  url.searchParams.set('q', refString);
  url.searchParams.set('include-headings', 'false');
  url.searchParams.set('include-footnotes', 'false');
  url.searchParams.set('include-verse-numbers', 'false');
  url.searchParams.set('include-short-copyright', 'false');
  url.searchParams.set('include-passage-references', 'false');

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Token ${apiKey}`,
    },
  });

  if (!response.ok) {
    console.error('ESV API error:', response.status);
    return null;
  }

  const data = (await response.json()) as ESVResponse;
  const text = data.passages[0]?.trim();

  if (text == null) {
    return null;
  }

  return {
    reference,
    text,
    translation: 'ESV',
  };
}

/**
 * Fetch verse from api.bible (NIV, etc.)
 * Requires BIBLE_API_KEY environment variable
 */
export async function fetchBibleAPIVerse(
  reference: VerseReference,
  translation: Translation
): Promise<VerseData | null> {
  const apiKey = process.env.BIBLE_API_KEY;
  if (apiKey == null) {
    console.error('BIBLE_API_KEY not configured');
    return null;
  }

  // Bible IDs for api.bible
  const bibleIds: Partial<Record<Translation, string>> = {
    NIV: '78a9f6124f344018-01', // NIV
    // Add more as needed
  };

  const bibleId = bibleIds[translation];
  if (bibleId == null) {
    console.error(`Unsupported translation for api.bible: ${translation}`);
    return null;
  }

  const refString = formatVerseReference(reference);
  const url = `https://api.scripture.api.bible/v1/bibles/${bibleId}/search?query=${encodeURIComponent(refString)}`;

  const response = await fetch(url, {
    headers: {
      'api-key': apiKey,
    },
  });

  if (!response.ok) {
    console.error('Bible API error:', response.status);
    return null;
  }

  const data = (await response.json()) as BibleAPIResponse;
  const text = data.data?.content?.trim();

  if (text == null) {
    return null;
  }

  return {
    reference,
    text,
    translation,
  };
}

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

interface BSBAPIResponse {
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

function extractBSBVerseText(content: (string | BSBVerseContent)[]): string {
  return content
    .map(item => {
      if (typeof item === 'string') return item;
      if (item.type === 'text' && item.text) return item.text;
      return '';
    })
    .join('')
    .trim();
}

/**
 * Fetch verse from BSB via bible.helloao.org API
 */
export async function fetchBSBVerse(reference: VerseReference): Promise<VerseData | null> {
  const bookCode = getBookCode(reference.book);
  if (!bookCode) {
    console.error(`Unknown book: ${reference.book}`);
    return null;
  }

  try {
    const response = await fetch(
      `https://bible.helloao.org/api/BSB/${bookCode}/${reference.chapter}.json`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('BSB API error:', response.status);
      return null;
    }

    const data = (await response.json()) as BSBAPIResponse;

    // Get the specific verses
    const startVerse = reference.startVerse;
    const endVerse = reference.endVerse ?? reference.startVerse;

    const verseTexts: string[] = [];
    for (const item of data.chapter.content) {
      if (item.type === 'verse' && item.number && item.content) {
        if (item.number >= startVerse && item.number <= endVerse) {
          verseTexts.push(extractBSBVerseText(item.content));
        }
      }
    }

    if (verseTexts.length === 0) {
      return null;
    }

    return {
      reference,
      text: verseTexts.join(' '),
      translation: 'BSB',
    };
  } catch (error) {
    console.error('Failed to fetch BSB verse:', error);
    return null;
  }
}

/**
 * Main function to fetch verse in specified translation
 */
export async function fetchVerse(
  reference: VerseReference,
  translation: Translation = 'ESV'
): Promise<VerseData | null> {
  switch (translation) {
    case 'ESV':
      return fetchESVVerse(reference);
    case 'BSB':
      return fetchBSBVerse(reference);
    case 'NIV':
      return fetchBibleAPIVerse(reference, 'NIV');
    default:
      console.error(`Translation ${translation} not yet supported`);
      return null;
  }
}
