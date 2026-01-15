import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReflectionQuestions } from './ReflectionQuestions';
import type { ReflectionQuestion } from '@/types';

const mockQuestions: ReflectionQuestion[] = [
  {
    question: 'What key words or phrases stand out in this passage?',
    category: 'observation',
  },
  {
    question: 'Who is the author speaking to in this passage?',
    category: 'observation',
  },
  {
    question: 'What does Paul mean by "all things work together for good"?',
    category: 'interpretation',
  },
  {
    question: 'How does this passage connect to the broader theme of Romans?',
    category: 'interpretation',
  },
  {
    question: 'How can you trust God more fully in difficult circumstances this week?',
    category: 'application',
  },
];

const singleCategoryQuestions: ReflectionQuestion[] = [
  {
    question: 'What is the main point of this verse?',
    category: 'observation',
  },
];

describe('ReflectionQuestions', () => {
  describe('loading state', () => {
    it('renders skeleton when loading', () => {
      render(
        <ReflectionQuestions
          questions={null}
          loading={true}
          answers={{}}
          onAnswerChange={() => {}}
        />
      );
      const skeleton = document.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows placeholder when questions is null', () => {
      render(
        <ReflectionQuestions
          questions={null}
          loading={false}
          answers={{}}
          onAnswerChange={() => {}}
        />
      );
      expect(
        screen.getByText(/Click "Generate Questions" to create reflection questions/)
      ).toBeInTheDocument();
    });

    it('shows placeholder when questions array is empty', () => {
      render(
        <ReflectionQuestions
          questions={[]}
          loading={false}
          answers={{}}
          onAnswerChange={() => {}}
        />
      );
      expect(
        screen.getByText(/Click "Generate Questions" to create reflection questions/)
      ).toBeInTheDocument();
    });
  });

  describe('questions display', () => {
    it('renders all questions', () => {
      render(
        <ReflectionQuestions
          questions={mockQuestions}
          loading={false}
          answers={{}}
          onAnswerChange={() => {}}
        />
      );
      expect(
        screen.getByText('What key words or phrases stand out in this passage?')
      ).toBeInTheDocument();
      expect(
        screen.getByText('What does Paul mean by "all things work together for good"?')
      ).toBeInTheDocument();
      expect(
        screen.getByText('How can you trust God more fully in difficult circumstances this week?')
      ).toBeInTheDocument();
    });

    it('groups questions by category', () => {
      render(
        <ReflectionQuestions
          questions={mockQuestions}
          loading={false}
          answers={{}}
          onAnswerChange={() => {}}
        />
      );
      expect(screen.getByText('Observation')).toBeInTheDocument();
      expect(screen.getByText('Interpretation')).toBeInTheDocument();
      expect(screen.getByText('Application')).toBeInTheDocument();
    });

    it('renders category descriptions', () => {
      render(
        <ReflectionQuestions
          questions={mockQuestions}
          loading={false}
          answers={{}}
          onAnswerChange={() => {}}
        />
      );
      expect(screen.getByText('What does the text say?')).toBeInTheDocument();
      expect(screen.getByText('What does it mean?')).toBeInTheDocument();
      expect(screen.getByText('How can I apply this?')).toBeInTheDocument();
    });

    it('only renders categories that have questions', () => {
      render(
        <ReflectionQuestions
          questions={singleCategoryQuestions}
          loading={false}
          answers={{}}
          onAnswerChange={() => {}}
        />
      );
      expect(screen.getByText('Observation')).toBeInTheDocument();
      expect(screen.queryByText('Interpretation')).not.toBeInTheDocument();
      expect(screen.queryByText('Application')).not.toBeInTheDocument();
    });
  });

  describe('answer inputs', () => {
    it('renders textarea for each question', () => {
      render(
        <ReflectionQuestions
          questions={mockQuestions}
          loading={false}
          answers={{}}
          onAnswerChange={() => {}}
        />
      );
      const textareas = screen.getAllByPlaceholderText('Write your reflection...');
      expect(textareas).toHaveLength(5);
    });

    it('displays existing answers', () => {
      const answers = {
        0: 'My observation notes',
        2: 'My interpretation notes',
      };
      render(
        <ReflectionQuestions
          questions={mockQuestions}
          loading={false}
          answers={answers}
          onAnswerChange={() => {}}
        />
      );
      expect(screen.getByDisplayValue('My observation notes')).toBeInTheDocument();
      expect(screen.getByDisplayValue('My interpretation notes')).toBeInTheDocument();
    });

    it('calls onAnswerChange when typing', () => {
      const handleChange = vi.fn();
      render(
        <ReflectionQuestions
          questions={mockQuestions}
          loading={false}
          answers={{}}
          onAnswerChange={handleChange}
        />
      );
      const textareas = screen.getAllByPlaceholderText('Write your reflection...');
      fireEvent.change(textareas[0], { target: { value: 'New answer' } });
      expect(handleChange).toHaveBeenCalledWith(0, 'New answer');
    });
  });

  describe('priority of states', () => {
    it('loading takes priority over empty', () => {
      render(
        <ReflectionQuestions
          questions={null}
          loading={true}
          answers={{}}
          onAnswerChange={() => {}}
        />
      );
      expect(screen.queryByText(/Click "Generate Questions"/)).not.toBeInTheDocument();
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });
  });
});
