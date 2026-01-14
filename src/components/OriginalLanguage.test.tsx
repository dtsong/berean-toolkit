import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OriginalLanguage } from './OriginalLanguage';
import type { OriginalLanguageWord } from '@/types';

const mockWords: OriginalLanguageWord[] = [
  {
    word: 'ἀγάπη',
    transliteration: 'agapē',
    strongsNumber: 'G26',
    definition: 'love, goodwill, benevolence',
    partOfSpeech: 'noun',
  },
  {
    word: 'θεός',
    transliteration: 'theos',
    strongsNumber: 'G2316',
    definition: 'God, a deity',
    partOfSpeech: 'noun',
  },
];

const mockWordWithoutPartOfSpeech: OriginalLanguageWord = {
  word: 'κόσμος',
  transliteration: 'kosmos',
  strongsNumber: 'G2889',
  definition: 'world, universe, the earth',
};

describe('OriginalLanguage', () => {
  describe('loading state', () => {
    it('renders skeleton when loading', () => {
      render(<OriginalLanguage words={[]} loading={true} />);
      const skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });

    it('renders three skeleton items', () => {
      const { container } = render(<OriginalLanguage words={[]} loading={true} />);
      const skeletonItems = container.querySelectorAll('.h-16');
      expect(skeletonItems).toHaveLength(3);
    });
  });

  describe('empty state', () => {
    it('shows placeholder when words array is empty', () => {
      render(<OriginalLanguage words={[]} />);
      expect(screen.getByText('Original language data will appear here')).toBeInTheDocument();
    });
  });

  describe('word display', () => {
    it('renders all words', () => {
      render(<OriginalLanguage words={mockWords} />);
      expect(screen.getByText('ἀγάπη')).toBeInTheDocument();
      expect(screen.getByText('θεός')).toBeInTheDocument();
    });

    it('renders transliterations', () => {
      render(<OriginalLanguage words={mockWords} />);
      expect(screen.getByText('agapē')).toBeInTheDocument();
      expect(screen.getByText('theos')).toBeInTheDocument();
    });

    it("renders Strong's numbers", () => {
      render(<OriginalLanguage words={mockWords} />);
      expect(screen.getByText('G26')).toBeInTheDocument();
      expect(screen.getByText('G2316')).toBeInTheDocument();
    });

    it('renders definitions', () => {
      render(<OriginalLanguage words={mockWords} />);
      expect(screen.getByText('love, goodwill, benevolence')).toBeInTheDocument();
      expect(screen.getByText('God, a deity')).toBeInTheDocument();
    });

    it('renders part of speech when present', () => {
      render(<OriginalLanguage words={mockWords} />);
      const nouns = screen.getAllByText('noun');
      expect(nouns).toHaveLength(2);
    });

    it('does not render part of speech when absent', () => {
      render(<OriginalLanguage words={[mockWordWithoutPartOfSpeech]} />);
      expect(screen.getByText('κόσμος')).toBeInTheDocument();
      expect(screen.queryByText('noun')).not.toBeInTheDocument();
    });
  });

  describe('priority of states', () => {
    it('loading takes priority over empty', () => {
      render(<OriginalLanguage words={[]} loading={true} />);
      expect(screen.queryByText('Original language data will appear here')).not.toBeInTheDocument();
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });
  });
});
