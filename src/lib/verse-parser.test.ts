import { describe, it, expect } from 'vitest';
import { normalizeBookName, parseVerseReference, formatVerseReference } from './verse-parser';

describe('normalizeBookName', () => {
  it('returns full name for known abbreviations', () => {
    expect(normalizeBookName('jn')).toBe('John');
    expect(normalizeBookName('mt')).toBe('Matthew');
    expect(normalizeBookName('gen')).toBe('Genesis');
    expect(normalizeBookName('rev')).toBe('Revelation');
  });

  it('handles case insensitivity', () => {
    expect(normalizeBookName('JN')).toBe('John');
    expect(normalizeBookName('Jn')).toBe('John');
    expect(normalizeBookName('MT')).toBe('Matthew');
  });

  it('handles numbered books', () => {
    expect(normalizeBookName('1co')).toBe('1 Corinthians');
    expect(normalizeBookName('2cor')).toBe('2 Corinthians');
    expect(normalizeBookName('1pe')).toBe('1 Peter');
    expect(normalizeBookName('1jn')).toBe('1 John');
  });

  it('returns input unchanged for full book names', () => {
    expect(normalizeBookName('John')).toBe('John');
    expect(normalizeBookName('Genesis')).toBe('Genesis');
    expect(normalizeBookName('Revelation')).toBe('Revelation');
  });

  it('returns input unchanged for unknown abbreviations', () => {
    expect(normalizeBookName('xyz')).toBe('xyz');
    expect(normalizeBookName('unknown')).toBe('unknown');
  });

  it('trims whitespace', () => {
    expect(normalizeBookName('  jn  ')).toBe('John');
    expect(normalizeBookName('\tmt\n')).toBe('Matthew');
  });
});

describe('parseVerseReference', () => {
  describe('valid references', () => {
    it('parses simple verse reference', () => {
      const result = parseVerseReference('John 3:16');
      expect(result).toEqual({
        book: 'John',
        chapter: 3,
        startVerse: 16,
        endVerse: undefined,
      });
    });

    it('parses verse range', () => {
      const result = parseVerseReference('John 3:16-18');
      expect(result).toEqual({
        book: 'John',
        chapter: 3,
        startVerse: 16,
        endVerse: 18,
      });
    });

    it('parses abbreviated book names', () => {
      const result = parseVerseReference('Jn 3:16');
      expect(result).toEqual({
        book: 'John',
        chapter: 3,
        startVerse: 16,
        endVerse: undefined,
      });
    });

    it('parses numbered books', () => {
      const result = parseVerseReference('1 Corinthians 13:4-7');
      expect(result).toEqual({
        book: '1 Corinthians',
        chapter: 13,
        startVerse: 4,
        endVerse: 7,
      });
    });

    it('parses numbered book abbreviations', () => {
      const result = parseVerseReference('1Cor 13:4');
      expect(result).toEqual({
        book: '1 Corinthians',
        chapter: 13,
        startVerse: 4,
        endVerse: undefined,
      });
    });

    it('handles extra whitespace', () => {
      const result = parseVerseReference('  John   3:16  ');
      expect(result).toEqual({
        book: 'John',
        chapter: 3,
        startVerse: 16,
        endVerse: undefined,
      });
    });

    it('parses Old Testament references', () => {
      expect(parseVerseReference('Gen 1:1')).toEqual({
        book: 'Genesis',
        chapter: 1,
        startVerse: 1,
        endVerse: undefined,
      });
      expect(parseVerseReference('Psalms 23:1-6')).toEqual({
        book: 'Psalms',
        chapter: 23,
        startVerse: 1,
        endVerse: 6,
      });
    });
  });

  describe('invalid references', () => {
    it('returns null for empty string', () => {
      expect(parseVerseReference('')).toBeNull();
    });

    it('returns null for missing verse', () => {
      expect(parseVerseReference('John 3')).toBeNull();
    });

    it('returns null for missing chapter', () => {
      expect(parseVerseReference('John :16')).toBeNull();
    });

    it('returns null for missing book', () => {
      expect(parseVerseReference('3:16')).toBeNull();
    });

    it('returns null for malformed input', () => {
      expect(parseVerseReference('not a verse')).toBeNull();
      expect(parseVerseReference('John three:sixteen')).toBeNull();
    });
  });
});

describe('formatVerseReference', () => {
  it('formats single verse reference', () => {
    const ref = { book: 'John', chapter: 3, startVerse: 16 };
    expect(formatVerseReference(ref)).toBe('John 3:16');
  });

  it('formats verse range', () => {
    const ref = { book: 'John', chapter: 3, startVerse: 16, endVerse: 18 };
    expect(formatVerseReference(ref)).toBe('John 3:16-18');
  });

  it('formats numbered book references', () => {
    const ref = { book: '1 Corinthians', chapter: 13, startVerse: 4, endVerse: 7 };
    expect(formatVerseReference(ref)).toBe('1 Corinthians 13:4-7');
  });

  it('handles undefined endVerse', () => {
    const ref = { book: 'Genesis', chapter: 1, startVerse: 1, endVerse: undefined };
    expect(formatVerseReference(ref)).toBe('Genesis 1:1');
  });
});

describe('roundtrip parsing', () => {
  it('parses and formats back to original', () => {
    const references = ['John 3:16', 'Genesis 1:1', '1 Corinthians 13:4-7', 'Revelation 21:1-4'];
    for (const ref of references) {
      const parsed = parseVerseReference(ref);
      expect(parsed).not.toBeNull();
      expect(formatVerseReference(parsed!)).toBe(ref);
    }
  });
});
