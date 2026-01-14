#!/usr/bin/env bun
/* eslint-disable no-console, @typescript-eslint/explicit-function-return-type */
/**
 * Import Strong's Concordance data into Supabase
 *
 * Usage: bun run scripts/import-strongs.ts
 *
 * Prerequisites:
 * - Supabase running locally (supabase start)
 * - Migration applied (supabase db reset)
 */

import { createClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const strongsData = require('strongs') as Record<string, StrongsRawEntry>;

interface StrongsRawEntry {
  lemma: string;
  xlit?: string;
  pron?: string;
  derivation?: string;
  strongs_def?: string;
  kjv_def?: string;
}

interface StrongsDBEntry {
  number: string;
  language: 'hebrew' | 'greek';
  lemma: string;
  transliteration: string;
  pronunciation: string | null;
  definition: string;
  part_of_speech: string | null;
  kjv_usage: string[] | null;
}

function parseKjvUsage(kjvDef: string | undefined): string[] | null {
  if (!kjvDef) return null;
  const cleaned = kjvDef
    .replace(/\[idiom\]/g, '')
    .replace(/\(.*?\)/g, '')
    .split(/[,;]/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('X ') && !s.startsWith('['));
  return cleaned.length > 0 ? cleaned.slice(0, 10) : null;
}

function combineDefinition(entry: StrongsRawEntry): string {
  const parts: string[] = [];
  if (entry.strongs_def) {
    parts.push(entry.strongs_def.trim());
  }
  if (entry.derivation) {
    parts.push(`Derivation: ${entry.derivation.trim()}`);
  }
  return parts.join(' ') || 'No definition available';
}

function formatNumber(key: string): string {
  const prefix = key[0];
  const num = parseInt(key.slice(1), 10);
  return `${prefix}${num.toString().padStart(4, '0')}`;
}

function transformEntry(key: string, entry: StrongsRawEntry): StrongsDBEntry {
  const isHebrew = key.startsWith('H');
  return {
    number: formatNumber(key),
    language: isHebrew ? 'hebrew' : 'greek',
    lemma: entry.lemma || '',
    transliteration: entry.xlit || entry.lemma || '',
    pronunciation: entry.pron || null,
    definition: combineDefinition(entry),
    part_of_speech: null,
    kjv_usage: parseKjvUsage(entry.kjv_def),
  };
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

  console.log('Connecting to Supabase...');
  const supabase = createClient(supabaseUrl, supabaseKey);

  const keys = Object.keys(strongsData);
  console.log(`Found ${keys.length} Strong's entries to import`);

  const hebrewCount = keys.filter(k => k.startsWith('H')).length;
  const greekCount = keys.filter(k => k.startsWith('G')).length;
  console.log(`  Hebrew: ${hebrewCount}, Greek: ${greekCount}`);

  const entries: StrongsDBEntry[] = keys
    .filter(key => strongsData[key] !== undefined)
    .map(key => transformEntry(key, strongsData[key]!));

  console.log('Clearing existing entries...');
  const { error: deleteError } = await supabase.from('strongs_entries').delete().neq('number', '');

  if (deleteError) {
    console.error('Error clearing table:', deleteError);
    process.exit(1);
  }

  console.log('Inserting entries in batches...');
  const batchSize = 500;
  let inserted = 0;

  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    const { error } = await supabase.from('strongs_entries').insert(batch);

    if (error) {
      console.error(`Error inserting batch at ${i}:`, error);
      process.exit(1);
    }

    inserted += batch.length;
    process.stdout.write(`\r  Inserted ${inserted}/${entries.length} entries`);
  }

  console.log('\n\nVerifying import...');
  const { count, error: countError } = await supabase
    .from('strongs_entries')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Error counting:', countError);
  } else {
    console.log(`Total entries in database: ${count}`);
  }

  const { data: sample } = await supabase
    .from('strongs_entries')
    .select('*')
    .in('number', ['H0430', 'G2316'])
    .limit(2);

  console.log('\nSample entries:');
  sample?.forEach(entry => {
    console.log(`  ${entry.number}: ${entry.lemma} - ${entry.definition.slice(0, 60)}...`);
  });

  console.log('\nImport complete!');
}

main().catch(console.error);
