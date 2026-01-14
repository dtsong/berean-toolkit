import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getBookCode,
  getTestament,
  getOriginalLanguage,
  formatReference,
  fetchBSBChapter,
  fetchBSBVerses,
  fetchVersesByReference,
} from './bible';

describe('getBookCode', () => {
  describe('Old Testament books', () => {
    it('returns correct codes for Pentateuch', () => {
      expect(getBookCode('Genesis')).toBe('GEN');
      expect(getBookCode('Exodus')).toBe('EXO');
      expect(getBookCode('Leviticus')).toBe('LEV');
      expect(getBookCode('Numbers')).toBe('NUM');
      expect(getBookCode('Deuteronomy')).toBe('DEU');
    });

    it('returns correct codes for Historical books', () => {
      expect(getBookCode('Joshua')).toBe('JOS');
      expect(getBookCode('Judges')).toBe('JDG');
      expect(getBookCode('Ruth')).toBe('RUT');
      expect(getBookCode('1 Samuel')).toBe('1SA');
      expect(getBookCode('2 Samuel')).toBe('2SA');
      expect(getBookCode('1 Kings')).toBe('1KI');
      expect(getBookCode('2 Kings')).toBe('2KI');
    });

    it('returns correct codes for Wisdom literature', () => {
      expect(getBookCode('Job')).toBe('JOB');
      expect(getBookCode('Psalms')).toBe('PSA');
      expect(getBookCode('Proverbs')).toBe('PRO');
      expect(getBookCode('Ecclesiastes')).toBe('ECC');
      expect(getBookCode('Song of Solomon')).toBe('SNG');
    });

    it('returns correct codes for Major Prophets', () => {
      expect(getBookCode('Isaiah')).toBe('ISA');
      expect(getBookCode('Jeremiah')).toBe('JER');
      expect(getBookCode('Lamentations')).toBe('LAM');
      expect(getBookCode('Ezekiel')).toBe('EZK');
      expect(getBookCode('Daniel')).toBe('DAN');
    });

    it('returns correct codes for Minor Prophets', () => {
      expect(getBookCode('Hosea')).toBe('HOS');
      expect(getBookCode('Joel')).toBe('JOL');
      expect(getBookCode('Amos')).toBe('AMO');
      expect(getBookCode('Malachi')).toBe('MAL');
    });
  });

  describe('New Testament books', () => {
    it('returns correct codes for Gospels', () => {
      expect(getBookCode('Matthew')).toBe('MAT');
      expect(getBookCode('Mark')).toBe('MRK');
      expect(getBookCode('Luke')).toBe('LUK');
      expect(getBookCode('John')).toBe('JHN');
    });

    it('returns correct codes for Acts and Pauline epistles', () => {
      expect(getBookCode('Acts')).toBe('ACT');
      expect(getBookCode('Romans')).toBe('ROM');
      expect(getBookCode('1 Corinthians')).toBe('1CO');
      expect(getBookCode('2 Corinthians')).toBe('2CO');
      expect(getBookCode('Galatians')).toBe('GAL');
      expect(getBookCode('Ephesians')).toBe('EPH');
    });

    it('returns correct codes for General epistles', () => {
      expect(getBookCode('Hebrews')).toBe('HEB');
      expect(getBookCode('James')).toBe('JAS');
      expect(getBookCode('1 Peter')).toBe('1PE');
      expect(getBookCode('2 Peter')).toBe('2PE');
      expect(getBookCode('Revelation')).toBe('REV');
    });
  });

  describe('case insensitivity', () => {
    it('handles lowercase book names', () => {
      expect(getBookCode('genesis')).toBe('GEN');
      expect(getBookCode('john')).toBe('JHN');
      expect(getBookCode('revelation')).toBe('REV');
    });

    it('handles mixed case book names', () => {
      expect(getBookCode('GENESIS')).toBe('GEN');
      expect(getBookCode('GeNeSiS')).toBe('GEN');
    });
  });

  describe('variations and abbreviations', () => {
    it('handles Song of Songs variation', () => {
      expect(getBookCode('song of songs')).toBe('SNG');
      expect(getBookCode('songs')).toBe('SNG');
    });

    it('handles Psalm singular', () => {
      expect(getBookCode('psalm')).toBe('PSA');
    });

    it('handles common abbreviations', () => {
      expect(getBookCode('1cor')).toBe('1CO');
      expect(getBookCode('2cor')).toBe('2CO');
      expect(getBookCode('1pet')).toBe('1PE');
    });
  });

  describe('invalid books', () => {
    it('returns null for unknown books', () => {
      expect(getBookCode('NotABook')).toBeNull();
      expect(getBookCode('Hezekiah')).toBeNull();
      expect(getBookCode('')).toBeNull();
    });
  });
});

describe('getTestament', () => {
  describe('Old Testament books', () => {
    it('returns OT for Genesis through Malachi', () => {
      expect(getTestament('GEN')).toBe('OT');
      expect(getTestament('EXO')).toBe('OT');
      expect(getTestament('PSA')).toBe('OT');
      expect(getTestament('ISA')).toBe('OT');
      expect(getTestament('MAL')).toBe('OT');
    });

    it('handles lowercase codes', () => {
      expect(getTestament('gen')).toBe('OT');
      expect(getTestament('mal')).toBe('OT');
    });
  });

  describe('New Testament books', () => {
    it('returns NT for Matthew through Revelation', () => {
      expect(getTestament('MAT')).toBe('NT');
      expect(getTestament('JHN')).toBe('NT');
      expect(getTestament('ACT')).toBe('NT');
      expect(getTestament('ROM')).toBe('NT');
      expect(getTestament('REV')).toBe('NT');
    });

    it('handles lowercase codes', () => {
      expect(getTestament('mat')).toBe('NT');
      expect(getTestament('rev')).toBe('NT');
    });
  });

  describe('boundary books', () => {
    it('Malachi is the last OT book', () => {
      expect(getTestament('MAL')).toBe('OT');
    });

    it('Matthew is the first NT book', () => {
      expect(getTestament('MAT')).toBe('NT');
    });
  });
});

describe('getOriginalLanguage', () => {
  it('returns Hebrew for OT books', () => {
    expect(getOriginalLanguage('GEN')).toBe('Hebrew');
    expect(getOriginalLanguage('PSA')).toBe('Hebrew');
    expect(getOriginalLanguage('ISA')).toBe('Hebrew');
    expect(getOriginalLanguage('MAL')).toBe('Hebrew');
  });

  it('returns Greek for NT books', () => {
    expect(getOriginalLanguage('MAT')).toBe('Greek');
    expect(getOriginalLanguage('JHN')).toBe('Greek');
    expect(getOriginalLanguage('ROM')).toBe('Greek');
    expect(getOriginalLanguage('REV')).toBe('Greek');
  });

  it('handles lowercase codes', () => {
    expect(getOriginalLanguage('gen')).toBe('Hebrew');
    expect(getOriginalLanguage('mat')).toBe('Greek');
  });
});

describe('formatReference', () => {
  it('formats single verse', () => {
    expect(formatReference('John', 3, 16)).toBe('John 3:16');
    expect(formatReference('Genesis', 1, 1)).toBe('Genesis 1:1');
  });

  it('formats verse range', () => {
    expect(formatReference('John', 3, 16, 18)).toBe('John 3:16-18');
    expect(formatReference('Romans', 8, 28, 30)).toBe('Romans 8:28-30');
  });

  it('handles same start and end verse', () => {
    expect(formatReference('John', 3, 16, 16)).toBe('John 3:16');
  });

  it('handles undefined end verse', () => {
    expect(formatReference('John', 3, 16, undefined)).toBe('John 3:16');
  });

  it('formats numbered book names', () => {
    expect(formatReference('1 Corinthians', 13, 4, 7)).toBe('1 Corinthians 13:4-7');
    expect(formatReference('2 Timothy', 3, 16)).toBe('2 Timothy 3:16');
  });
});

const originalFetch = globalThis.fetch;

describe('fetchBSBChapter', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('fetches chapter successfully', async () => {
    const mockChapter = {
      book: 'John',
      chapter: 3,
      verses: [
        { verse: 16, text: 'For God so loved the world...' },
        { verse: 17, text: 'For God did not send his Son...' },
      ],
    };

    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify(mockChapter), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const result = await fetchBSBChapter('JHN', 3);

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/bible/JHN/3');
    expect(result).toEqual(mockChapter);
  });

  it('returns null on non-ok response', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(new Response('Not Found', { status: 404 }));

    const result = await fetchBSBChapter('INVALID', 1);
    expect(result).toBeNull();
  });

  it('returns null on fetch error', async () => {
    vi.mocked(globalThis.fetch).mockRejectedValue(new Error('Network error'));

    const result = await fetchBSBChapter('JHN', 3);
    expect(result).toBeNull();
  });
});

describe('fetchBSBVerses', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('returns null for unknown book', async () => {
    const result = await fetchBSBVerses({
      book: 'UnknownBook',
      chapter: 1,
      startVerse: 1,
    });
    expect(result).toBeNull();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('fetches and filters single verse', async () => {
    const mockChapter = {
      book: 'John',
      chapter: 3,
      verses: [
        { verse: 15, text: 'that whoever believes in him...' },
        { verse: 16, text: 'For God so loved the world...' },
        { verse: 17, text: 'For God did not send his Son...' },
      ],
    };

    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify(mockChapter), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const result = await fetchBSBVerses({
      book: 'John',
      chapter: 3,
      startVerse: 16,
    });

    expect(result).toHaveLength(1);
    expect(result?.[0]?.verse).toBe(16);
  });

  it('fetches and filters verse range', async () => {
    const mockChapter = {
      book: 'John',
      chapter: 3,
      verses: [
        { verse: 15, text: 'text 15' },
        { verse: 16, text: 'text 16' },
        { verse: 17, text: 'text 17' },
        { verse: 18, text: 'text 18' },
      ],
    };

    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify(mockChapter), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const result = await fetchBSBVerses({
      book: 'John',
      chapter: 3,
      startVerse: 16,
      endVerse: 17,
    });

    expect(result).toHaveLength(2);
    expect(result?.[0]?.verse).toBe(16);
    expect(result?.[1]?.verse).toBe(17);
  });

  it('returns null if chapter fetch fails', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(new Response('Not Found', { status: 404 }));

    const result = await fetchBSBVerses({
      book: 'John',
      chapter: 99,
      startVerse: 1,
    });
    expect(result).toBeNull();
  });
});

describe('fetchVersesByReference', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('returns null for invalid reference', async () => {
    const result = await fetchVersesByReference('not a valid reference');
    expect(result).toBeNull();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('parses and fetches valid reference', async () => {
    const mockChapter = {
      book: 'John',
      chapter: 3,
      verses: [{ verse: 16, text: 'For God so loved...' }],
    };

    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify(mockChapter), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const result = await fetchVersesByReference('John 3:16');

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/bible/JHN/3');
    expect(result).toHaveLength(1);
  });
});
