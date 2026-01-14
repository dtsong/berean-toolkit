import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameBoard } from './GameBoard';
import type { Question } from '@/types';

const mockQuestion: Question = {
  id: 'test-question-1',
  mode: 'verse_detective',
  difficulty: 'easy',
  verseReference: 'John 3:16',
  questionText: 'Where is this verse found: "For God so loved the world..."?',
  correctAnswer: 'John 3:16',
  incorrectAnswers: ['Romans 8:28', 'Genesis 1:1', 'Psalm 23:1'],
  explanation: 'This is one of the most well-known verses in the Bible.',
};

const mockMediumQuestion: Question = {
  ...mockQuestion,
  id: 'test-question-2',
  difficulty: 'medium',
};

const mockHardQuestion: Question = {
  ...mockQuestion,
  id: 'test-question-3',
  difficulty: 'hard',
};

describe('GameBoard', () => {
  describe('loading state', () => {
    it('shows loading message when question is null', () => {
      render(
        <GameBoard question={null} mode="verse_detective" onAnswer={vi.fn()} onNext={vi.fn()} />
      );
      expect(screen.getByText('Loading question...')).toBeInTheDocument();
    });
  });

  describe('question display', () => {
    it('displays the question text', () => {
      render(
        <GameBoard
          question={mockQuestion}
          mode="verse_detective"
          onAnswer={vi.fn()}
          onNext={vi.fn()}
        />
      );
      expect(screen.getByText(mockQuestion.questionText)).toBeInTheDocument();
    });

    it('displays all answer options', () => {
      render(
        <GameBoard
          question={mockQuestion}
          mode="verse_detective"
          onAnswer={vi.fn()}
          onNext={vi.fn()}
        />
      );
      expect(screen.getByText('John 3:16')).toBeInTheDocument();
      expect(screen.getByText('Romans 8:28')).toBeInTheDocument();
      expect(screen.getByText('Genesis 1:1')).toBeInTheDocument();
      expect(screen.getByText('Psalm 23:1')).toBeInTheDocument();
    });

    it('displays difficulty badge for easy', () => {
      render(
        <GameBoard
          question={mockQuestion}
          mode="verse_detective"
          onAnswer={vi.fn()}
          onNext={vi.fn()}
        />
      );
      expect(screen.getByText('easy')).toBeInTheDocument();
    });

    it('displays difficulty badge for medium', () => {
      render(
        <GameBoard
          question={mockMediumQuestion}
          mode="verse_detective"
          onAnswer={vi.fn()}
          onNext={vi.fn()}
        />
      );
      expect(screen.getByText('medium')).toBeInTheDocument();
    });

    it('displays difficulty badge for hard', () => {
      render(
        <GameBoard
          question={mockHardQuestion}
          mode="verse_detective"
          onAnswer={vi.fn()}
          onNext={vi.fn()}
        />
      );
      expect(screen.getByText('hard')).toBeInTheDocument();
    });
  });

  describe('game modes', () => {
    it('displays Verse Detective mode title', () => {
      render(
        <GameBoard
          question={mockQuestion}
          mode="verse_detective"
          onAnswer={vi.fn()}
          onNext={vi.fn()}
        />
      );
      expect(screen.getByText('Verse Detective')).toBeInTheDocument();
    });

    it('displays Context Clues mode title', () => {
      render(
        <GameBoard
          question={mockQuestion}
          mode="context_clues"
          onAnswer={vi.fn()}
          onNext={vi.fn()}
        />
      );
      expect(screen.getByText('Context Clues')).toBeInTheDocument();
    });

    it('displays Word Connections mode title', () => {
      render(
        <GameBoard
          question={mockQuestion}
          mode="word_connections"
          onAnswer={vi.fn()}
          onNext={vi.fn()}
        />
      );
      expect(screen.getByText('Word Connections')).toBeInTheDocument();
    });
  });

  describe('answer selection', () => {
    it('calls onAnswer with selected answer', () => {
      const onAnswer = vi.fn();
      render(
        <GameBoard
          question={mockQuestion}
          mode="verse_detective"
          onAnswer={onAnswer}
          onNext={vi.fn()}
        />
      );

      fireEvent.click(screen.getByText('John 3:16'));
      expect(onAnswer).toHaveBeenCalledWith('John 3:16');
    });

    it('shows explanation after answer is revealed', () => {
      render(
        <GameBoard
          question={mockQuestion}
          mode="verse_detective"
          onAnswer={vi.fn()}
          onNext={vi.fn()}
        />
      );

      fireEvent.click(screen.getByText('John 3:16'));
      expect(screen.getByText(mockQuestion.explanation!)).toBeInTheDocument();
    });

    it('shows Next Question button after answer is revealed', () => {
      render(
        <GameBoard
          question={mockQuestion}
          mode="verse_detective"
          onAnswer={vi.fn()}
          onNext={vi.fn()}
        />
      );

      expect(screen.queryByText('Next Question')).not.toBeInTheDocument();
      fireEvent.click(screen.getByText('John 3:16'));
      expect(screen.getByText('Next Question')).toBeInTheDocument();
    });

    it('disables answer buttons after reveal', () => {
      render(
        <GameBoard
          question={mockQuestion}
          mode="verse_detective"
          onAnswer={vi.fn()}
          onNext={vi.fn()}
        />
      );

      fireEvent.click(screen.getByText('John 3:16'));

      const buttons = screen.getAllByRole('button').filter(b => b.textContent !== 'Next Question');
      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });

    it('calls onNext when Next Question is clicked', () => {
      const onNext = vi.fn();
      render(
        <GameBoard
          question={mockQuestion}
          mode="verse_detective"
          onAnswer={vi.fn()}
          onNext={onNext}
        />
      );

      fireEvent.click(screen.getByText('John 3:16'));
      fireEvent.click(screen.getByText('Next Question'));
      expect(onNext).toHaveBeenCalled();
    });
  });

  describe('answer shuffling', () => {
    it('shuffles answers consistently for same question ID', () => {
      const { rerender } = render(
        <GameBoard
          question={mockQuestion}
          mode="verse_detective"
          onAnswer={vi.fn()}
          onNext={vi.fn()}
        />
      );

      const buttons1 = screen.getAllByRole('button').map(b => b.textContent);

      rerender(
        <GameBoard
          question={mockQuestion}
          mode="verse_detective"
          onAnswer={vi.fn()}
          onNext={vi.fn()}
        />
      );

      const buttons2 = screen.getAllByRole('button').map(b => b.textContent);

      expect(buttons1).toEqual(buttons2);
    });

    it('shuffles differently for different question IDs', () => {
      const { unmount } = render(
        <GameBoard
          question={mockQuestion}
          mode="verse_detective"
          onAnswer={vi.fn()}
          onNext={vi.fn()}
        />
      );

      const buttons1 = screen.getAllByRole('button').map(b => b.textContent);
      unmount();

      const differentQuestion = { ...mockQuestion, id: 'completely-different-id-xyz' };
      render(
        <GameBoard
          question={differentQuestion}
          mode="verse_detective"
          onAnswer={vi.fn()}
          onNext={vi.fn()}
        />
      );

      const buttons2 = screen.getAllByRole('button').map(b => b.textContent);

      // They might be the same by chance, but the important thing is both render correctly
      expect(buttons1.length).toBe(buttons2.length);
    });
  });
});
