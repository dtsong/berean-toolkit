import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVerse } from './useVerse';

const mockVerseData = {
  reference: {
    book: 'John',
    chapter: 3,
    startVerse: 16,
  },
  text: 'For God so loved the world...',
  translation: 'ESV' as const,
};

const originalFetch = globalThis.fetch;

describe('useVerse', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe('initial state', () => {
    it('starts with null verse', () => {
      const { result } = renderHook(() => useVerse());
      expect(result.current.verse).toBeNull();
    });

    it('starts with loading false', () => {
      const { result } = renderHook(() => useVerse());
      expect(result.current.loading).toBe(false);
    });

    it('starts with null error', () => {
      const { result } = renderHook(() => useVerse());
      expect(result.current.error).toBeNull();
    });
  });

  describe('fetchVerse success', () => {
    it('sets loading to true during fetch', async () => {
      let resolvePromise: (value: Response) => void;
      const fetchPromise = new Promise<Response>(resolve => {
        resolvePromise = resolve;
      });

      vi.mocked(fetch).mockReturnValue(fetchPromise);

      const { result } = renderHook(() => useVerse());

      act(() => {
        void result.current.fetchVerse('John 3:16');
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        resolvePromise!(
          new Response(JSON.stringify(mockVerseData), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );
      });
    });

    it('updates verse on successful fetch', async () => {
      vi.mocked(fetch).mockResolvedValue(
        new Response(JSON.stringify(mockVerseData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const { result } = renderHook(() => useVerse());

      await act(async () => {
        await result.current.fetchVerse('John 3:16');
      });

      expect(result.current.verse).toEqual(mockVerseData);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('uses ESV as default translation', async () => {
      vi.mocked(fetch).mockResolvedValue(
        new Response(JSON.stringify(mockVerseData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const { result } = renderHook(() => useVerse());

      await act(async () => {
        await result.current.fetchVerse('John 3:16');
      });

      expect(fetch).toHaveBeenCalledWith('/api/verse?reference=John%203%3A16&translation=ESV');
    });

    it('uses specified translation', async () => {
      vi.mocked(fetch).mockResolvedValue(
        new Response(JSON.stringify(mockVerseData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const { result } = renderHook(() => useVerse());

      await act(async () => {
        await result.current.fetchVerse('John 3:16', 'BSB');
      });

      expect(fetch).toHaveBeenCalledWith('/api/verse?reference=John%203%3A16&translation=BSB');
    });
  });

  describe('fetchVerse error handling', () => {
    it('sets error on non-ok response', async () => {
      vi.mocked(fetch).mockResolvedValue(
        new Response(JSON.stringify({ error: 'Verse not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const { result } = renderHook(() => useVerse());

      await act(async () => {
        await result.current.fetchVerse('Invalid 99:99');
      });

      expect(result.current.error).toBe('Verse not found');
      expect(result.current.verse).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it('uses default error message when none provided', async () => {
      vi.mocked(fetch).mockResolvedValue(
        new Response(JSON.stringify({}), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const { result } = renderHook(() => useVerse());

      await act(async () => {
        await result.current.fetchVerse('John 3:16');
      });

      expect(result.current.error).toBe('Failed to fetch verse');
    });

    it('handles fetch network errors', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useVerse());

      await act(async () => {
        await result.current.fetchVerse('John 3:16');
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.verse).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it('handles non-Error exceptions', async () => {
      vi.mocked(fetch).mockRejectedValue('string error');

      const { result } = renderHook(() => useVerse());

      await act(async () => {
        await result.current.fetchVerse('John 3:16');
      });

      expect(result.current.error).toBe('An error occurred');
    });
  });

  describe('clear function', () => {
    it('clears verse data', async () => {
      vi.mocked(fetch).mockResolvedValue(
        new Response(JSON.stringify(mockVerseData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const { result } = renderHook(() => useVerse());

      await act(async () => {
        await result.current.fetchVerse('John 3:16');
      });

      expect(result.current.verse).not.toBeNull();

      act(() => {
        result.current.clear();
      });

      expect(result.current.verse).toBeNull();
    });

    it('clears error state', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => useVerse());

      await act(async () => {
        await result.current.fetchVerse('John 3:16');
      });

      expect(result.current.error).not.toBeNull();

      act(() => {
        result.current.clear();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('state transitions', () => {
    it('clears previous error on new fetch', async () => {
      vi.mocked(fetch)
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce(
          new Response(JSON.stringify(mockVerseData), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        );

      const { result } = renderHook(() => useVerse());

      await act(async () => {
        await result.current.fetchVerse('Invalid');
      });

      expect(result.current.error).toBe('First error');

      await act(async () => {
        await result.current.fetchVerse('John 3:16');
      });

      expect(result.current.error).toBeNull();
      expect(result.current.verse).toEqual(mockVerseData);
    });
  });
});
