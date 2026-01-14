import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isValidStrongsNumber,
  getStrongsLanguage,
  formatStrongsNumber,
  fetchStrongsEntry,
  searchByStrongsNumber,
} from './strongs';

describe('isValidStrongsNumber', () => {
  describe('valid Hebrew numbers', () => {
    it('accepts H prefix with 1-4 digits', () => {
      expect(isValidStrongsNumber('H1')).toBe(true);
      expect(isValidStrongsNumber('H12')).toBe(true);
      expect(isValidStrongsNumber('H123')).toBe(true);
      expect(isValidStrongsNumber('H1234')).toBe(true);
    });

    it('accepts lowercase h prefix', () => {
      expect(isValidStrongsNumber('h1')).toBe(true);
      expect(isValidStrongsNumber('h430')).toBe(true);
    });

    it("accepts common Hebrew Strong's numbers", () => {
      expect(isValidStrongsNumber('H430')).toBe(true);
      expect(isValidStrongsNumber('H3068')).toBe(true);
      expect(isValidStrongsNumber('H8674')).toBe(true);
    });
  });

  describe('valid Greek numbers', () => {
    it('accepts G prefix with 1-4 digits', () => {
      expect(isValidStrongsNumber('G1')).toBe(true);
      expect(isValidStrongsNumber('G12')).toBe(true);
      expect(isValidStrongsNumber('G123')).toBe(true);
      expect(isValidStrongsNumber('G1234')).toBe(true);
    });

    it('accepts lowercase g prefix', () => {
      expect(isValidStrongsNumber('g1')).toBe(true);
      expect(isValidStrongsNumber('g26')).toBe(true);
    });

    it("accepts common Greek Strong's numbers", () => {
      expect(isValidStrongsNumber('G26')).toBe(true);
      expect(isValidStrongsNumber('G2316')).toBe(true);
      expect(isValidStrongsNumber('G5624')).toBe(true);
    });
  });

  describe('invalid numbers', () => {
    it('rejects numbers without prefix', () => {
      expect(isValidStrongsNumber('123')).toBe(false);
      expect(isValidStrongsNumber('1234')).toBe(false);
    });

    it('rejects invalid prefixes', () => {
      expect(isValidStrongsNumber('A123')).toBe(false);
      expect(isValidStrongsNumber('X1')).toBe(false);
      expect(isValidStrongsNumber('Z9999')).toBe(false);
    });

    it('rejects numbers with more than 4 digits', () => {
      expect(isValidStrongsNumber('H12345')).toBe(false);
      expect(isValidStrongsNumber('G99999')).toBe(false);
    });

    it('rejects empty or whitespace', () => {
      expect(isValidStrongsNumber('')).toBe(false);
      expect(isValidStrongsNumber('  ')).toBe(false);
    });

    it('rejects prefix only', () => {
      expect(isValidStrongsNumber('H')).toBe(false);
      expect(isValidStrongsNumber('G')).toBe(false);
    });

    it('rejects non-numeric after prefix', () => {
      expect(isValidStrongsNumber('Habc')).toBe(false);
      expect(isValidStrongsNumber('G12a')).toBe(false);
    });
  });
});

describe('getStrongsLanguage', () => {
  it('returns "hebrew" for H prefix', () => {
    expect(getStrongsLanguage('H1')).toBe('hebrew');
    expect(getStrongsLanguage('H430')).toBe('hebrew');
    expect(getStrongsLanguage('h3068')).toBe('hebrew');
  });

  it('returns "greek" for G prefix', () => {
    expect(getStrongsLanguage('G1')).toBe('greek');
    expect(getStrongsLanguage('G2316')).toBe('greek');
    expect(getStrongsLanguage('g26')).toBe('greek');
  });

  it('returns null for invalid numbers', () => {
    expect(getStrongsLanguage('')).toBeNull();
    expect(getStrongsLanguage('123')).toBeNull();
    expect(getStrongsLanguage('A123')).toBeNull();
    expect(getStrongsLanguage('H12345')).toBeNull();
  });
});

describe('formatStrongsNumber', () => {
  it('pads single digit numbers to 4 digits', () => {
    expect(formatStrongsNumber('H1')).toBe('H0001');
    expect(formatStrongsNumber('G1')).toBe('G0001');
  });

  it('pads 2-digit numbers to 4 digits', () => {
    expect(formatStrongsNumber('H26')).toBe('H0026');
    expect(formatStrongsNumber('G26')).toBe('G0026');
  });

  it('pads 3-digit numbers to 4 digits', () => {
    expect(formatStrongsNumber('H430')).toBe('H0430');
    expect(formatStrongsNumber('G316')).toBe('G0316');
  });

  it('keeps 4-digit numbers as-is', () => {
    expect(formatStrongsNumber('H3068')).toBe('H3068');
    expect(formatStrongsNumber('G2316')).toBe('G2316');
  });

  it('uppercases the prefix', () => {
    expect(formatStrongsNumber('h1')).toBe('H0001');
    expect(formatStrongsNumber('g26')).toBe('G0026');
  });

  it('returns null for invalid numbers', () => {
    expect(formatStrongsNumber('')).toBeNull();
    expect(formatStrongsNumber('123')).toBeNull();
    expect(formatStrongsNumber('H12345')).toBeNull();
    expect(formatStrongsNumber('invalid')).toBeNull();
  });
});

const originalFetch = globalThis.fetch;

describe('fetchStrongsEntry', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns null for invalid Strong's number", async () => {
    const result = await fetchStrongsEntry('invalid');
    expect(result).toBeNull();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('fetches entry with formatted number', async () => {
    const mockEntry = {
      number: 'H0430',
      word: 'אֱלֹהִים',
      transliteration: 'elohim',
      definition: 'God, gods',
    };

    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(JSON.stringify(mockEntry), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const result = await fetchStrongsEntry('H430');

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/strongs/H0430');
    expect(result).toEqual(mockEntry);
  });

  it('returns null on non-ok response', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(new Response('Not Found', { status: 404 }));

    const result = await fetchStrongsEntry('H9999');
    expect(result).toBeNull();
  });

  it('returns null on fetch error', async () => {
    vi.mocked(globalThis.fetch).mockRejectedValue(new Error('Network error'));

    const result = await fetchStrongsEntry('H430');
    expect(result).toBeNull();
  });
});

describe('searchByStrongsNumber', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns empty array for invalid Strong's number", async () => {
    const result = await searchByStrongsNumber('invalid');
    expect(result).toEqual([]);
  });

  it('returns empty array (placeholder implementation)', async () => {
    const result = await searchByStrongsNumber('H430');
    expect(result).toEqual([]);
  });
});
