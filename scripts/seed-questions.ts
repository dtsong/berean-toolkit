#!/usr/bin/env bun
/* eslint-disable no-console, @typescript-eslint/explicit-function-return-type */
/**
 * Seed verified game questions into Supabase.
 *
 * Usage:
 *   bun run scripts/seed-questions.ts
 *
 * Environment:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const questionsData = require('../src/data/questions.json') as {
  questions: Array<{
    id: string;
    mode: string;
    difficulty: string;
    verseReference: string;
    questionText: string;
    correctAnswer: string;
    incorrectAnswers: string[];
    strongsNumber?: string;
    explanation?: string;
  }>;
};

type QuestionsRowInsert = {
  id: string;
  mode: string;
  difficulty: string;
  verse_reference: string;
  question_text: string;
  correct_answer: string;
  incorrect_answers: string[];
  strongs_number: string | null;
  explanation: string | null;
  verified: boolean;
};

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY environment variable is required.');
    console.error('Run `supabase status` to get the service_role key for local development.');
    process.exit(1);
  }

  const rows: QuestionsRowInsert[] = questionsData.questions.map(q => ({
    id: q.id,
    mode: q.mode,
    difficulty: q.difficulty,
    verse_reference: q.verseReference,
    question_text: q.questionText,
    correct_answer: q.correctAnswer,
    incorrect_answers: q.incorrectAnswers,
    strongs_number: q.strongsNumber ?? null,
    explanation: q.explanation ?? null,
    verified: true,
  }));

  console.log(`Seeding ${rows.length} verified questions into Supabase...`);

  const supabase = createClient(supabaseUrl, supabaseKey);

  const batches = chunk(rows, 200);
  let processed = 0;

  for (const batch of batches) {
    const { error } = await supabase.from('questions').upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error('Error upserting questions:', error);
      process.exit(1);
    }

    processed += batch.length;
    process.stdout.write(`\r  Upserted ${processed}/${rows.length}`);
  }

  console.log('\n\nVerifying seed...');
  const { count, error: countError } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('verified', true);

  if (countError) {
    console.error('Error counting questions:', countError);
    process.exit(1);
  }

  console.log(`Verified questions in database: ${count}`);
  console.log('Seed complete.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
