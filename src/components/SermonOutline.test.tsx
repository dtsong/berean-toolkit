import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SermonOutline } from './SermonOutline';
import type { SermonOutline as SermonOutlineType } from '@/types';

const mockOutline: SermonOutlineType = {
  passage: 'Romans 8:28-30',
  title: 'The Golden Chain of Redemption',
  mainPoints: [
    {
      heading: 'God works all things for good',
      subPoints: ['For those who love God', 'For those called according to his purpose'],
    },
    {
      heading: 'The chain of salvation',
      subPoints: ['Foreknown', 'Predestined', 'Called', 'Justified', 'Glorified'],
    },
  ],
  keyThemes: ['Sovereignty', 'Providence', 'Salvation'],
  crossReferences: ['Ephesians 1:3-14', 'John 10:27-30', 'Philippians 1:6'],
};

const mockOutlineWithoutTitle: SermonOutlineType = {
  passage: 'John 3:16',
  mainPoints: [
    {
      heading: "God's love for the world",
      subPoints: [],
    },
  ],
  keyThemes: [],
  crossReferences: [],
};

describe('SermonOutline', () => {
  describe('loading state', () => {
    it('renders skeleton when loading', () => {
      render(<SermonOutline outline={null} loading={true} />);
      const skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows placeholder when outline is null', () => {
      render(<SermonOutline outline={null} />);
      expect(
        screen.getByText('Enter a passage to generate a suggested outline')
      ).toBeInTheDocument();
    });
  });

  describe('outline display', () => {
    it('renders passage reference', () => {
      render(<SermonOutline outline={mockOutline} />);
      expect(screen.getByText('Romans 8:28-30')).toBeInTheDocument();
    });

    it('renders title when present', () => {
      render(<SermonOutline outline={mockOutline} />);
      expect(screen.getByText('The Golden Chain of Redemption')).toBeInTheDocument();
    });

    it('does not render title when absent', () => {
      render(<SermonOutline outline={mockOutlineWithoutTitle} />);
      expect(screen.queryByText('The Golden Chain of Redemption')).not.toBeInTheDocument();
    });

    it('renders disclaimer note', () => {
      render(<SermonOutline outline={mockOutline} />);
      expect(screen.getByText(/This is a suggested outline/)).toBeInTheDocument();
    });
  });

  describe('main points', () => {
    it('renders main points section header', () => {
      render(<SermonOutline outline={mockOutline} />);
      expect(screen.getByText('Main Points')).toBeInTheDocument();
    });

    it('renders all main point headings', () => {
      render(<SermonOutline outline={mockOutline} />);
      expect(screen.getByText('God works all things for good')).toBeInTheDocument();
      expect(screen.getByText('The chain of salvation')).toBeInTheDocument();
    });

    it('renders numbered indicators', () => {
      render(<SermonOutline outline={mockOutline} />);
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('renders subpoints', () => {
      render(<SermonOutline outline={mockOutline} />);
      expect(screen.getByText(/For those who love God/)).toBeInTheDocument();
      expect(screen.getByText(/Foreknown/)).toBeInTheDocument();
      expect(screen.getByText(/Glorified/)).toBeInTheDocument();
    });

    it('handles points without subpoints', () => {
      render(<SermonOutline outline={mockOutlineWithoutTitle} />);
      expect(screen.getByText("God's love for the world")).toBeInTheDocument();
    });
  });

  describe('key themes', () => {
    it('renders key themes section when themes exist', () => {
      render(<SermonOutline outline={mockOutline} />);
      expect(screen.getByText('Key Themes')).toBeInTheDocument();
    });

    it('renders all themes', () => {
      render(<SermonOutline outline={mockOutline} />);
      expect(screen.getByText('Sovereignty')).toBeInTheDocument();
      expect(screen.getByText('Providence')).toBeInTheDocument();
      expect(screen.getByText('Salvation')).toBeInTheDocument();
    });

    it('does not render key themes section when empty', () => {
      render(<SermonOutline outline={mockOutlineWithoutTitle} />);
      expect(screen.queryByText('Key Themes')).not.toBeInTheDocument();
    });
  });

  describe('cross references', () => {
    it('renders related passages section when references exist', () => {
      render(<SermonOutline outline={mockOutline} />);
      expect(screen.getByText('Related Passages')).toBeInTheDocument();
    });

    it('renders all cross references', () => {
      render(<SermonOutline outline={mockOutline} />);
      expect(screen.getByText('Ephesians 1:3-14')).toBeInTheDocument();
      expect(screen.getByText('John 10:27-30')).toBeInTheDocument();
      expect(screen.getByText('Philippians 1:6')).toBeInTheDocument();
    });

    it('does not render related passages section when empty', () => {
      render(<SermonOutline outline={mockOutlineWithoutTitle} />);
      expect(screen.queryByText('Related Passages')).not.toBeInTheDocument();
    });
  });

  describe('priority of states', () => {
    it('loading takes priority over empty', () => {
      render(<SermonOutline outline={null} loading={true} />);
      expect(
        screen.queryByText('Enter a passage to generate a suggested outline')
      ).not.toBeInTheDocument();
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });
  });
});
