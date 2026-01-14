import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VerseDisplay } from './VerseDisplay';
import type { VerseData } from '@/types';

const mockVerse: VerseData = {
  reference: {
    book: 'John',
    chapter: 3,
    startVerse: 16,
  },
  text: 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.',
  translation: 'ESV',
};

const mockVerseWithRange: VerseData = {
  reference: {
    book: 'Romans',
    chapter: 8,
    startVerse: 28,
    endVerse: 30,
  },
  text: 'And we know that for those who love God all things work together for good...',
  translation: 'BSB',
};

describe('VerseDisplay', () => {
  describe('loading state', () => {
    it('renders skeleton when loading', () => {
      render(<VerseDisplay verse={null} loading={true} />);
      const skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });

    it('does not show verse text when loading', () => {
      render(<VerseDisplay verse={mockVerse} loading={true} />);
      expect(screen.queryByText(mockVerse.text)).not.toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('displays error message', () => {
      render(<VerseDisplay verse={null} error="Failed to fetch verse" />);
      expect(screen.getByText('Failed to fetch verse')).toBeInTheDocument();
    });

    it('does not show verse when error present', () => {
      render(<VerseDisplay verse={mockVerse} error="Some error" />);
      expect(screen.queryByText(mockVerse.text)).not.toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows placeholder when verse is null', () => {
      render(<VerseDisplay verse={null} />);
      expect(screen.getByText('Enter a verse reference to begin studying')).toBeInTheDocument();
    });
  });

  describe('verse display', () => {
    it('renders verse text', () => {
      render(<VerseDisplay verse={mockVerse} />);
      expect(screen.getByText(mockVerse.text)).toBeInTheDocument();
    });

    it('renders book, chapter, and verse', () => {
      render(<VerseDisplay verse={mockVerse} />);
      expect(screen.getByText('John 3:16')).toBeInTheDocument();
    });

    it('renders verse range when endVerse is present', () => {
      render(<VerseDisplay verse={mockVerseWithRange} />);
      expect(screen.getByText('Romans 8:28-30')).toBeInTheDocument();
    });

    it('renders translation badge', () => {
      render(<VerseDisplay verse={mockVerse} />);
      expect(screen.getByText('ESV')).toBeInTheDocument();
    });

    it('renders different translation badges', () => {
      render(<VerseDisplay verse={mockVerseWithRange} />);
      expect(screen.getByText('BSB')).toBeInTheDocument();
    });
  });

  describe('priority of states', () => {
    it('loading takes priority over error', () => {
      render(<VerseDisplay verse={null} loading={true} error="Error" />);
      expect(screen.queryByText('Error')).not.toBeInTheDocument();
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('error takes priority over empty', () => {
      render(<VerseDisplay verse={null} error="Error message" />);
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(
        screen.queryByText('Enter a verse reference to begin studying')
      ).not.toBeInTheDocument();
    });
  });
});
