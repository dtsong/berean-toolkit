-- Strong's Concordance Database Schema
-- Migration: 00002_strongs_concordance.sql
-- Stores complete Hebrew and Greek lexicon entries

CREATE TABLE public.strongs_entries (
  number TEXT PRIMARY KEY,        -- "H0001", "G2316" (zero-padded)
  language TEXT NOT NULL CHECK (language IN ('hebrew', 'greek')),
  lemma TEXT NOT NULL,            -- Original word (אָב, θεός)
  transliteration TEXT NOT NULL,  -- "ab", "theos"
  pronunciation TEXT,             -- "awb", "theh'-os"
  definition TEXT NOT NULL,       -- Full definition
  part_of_speech TEXT,            -- "noun masculine", "verb"
  kjv_usage JSONB,                -- ["father", "chief"]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Public read access (no auth required for lookups)
ALTER TABLE public.strongs_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read strongs entries" ON public.strongs_entries
  FOR SELECT USING (TRUE);

-- Indexes for efficient queries
CREATE INDEX idx_strongs_language ON public.strongs_entries(language);
CREATE INDEX idx_strongs_lemma ON public.strongs_entries(lemma);
CREATE INDEX idx_strongs_transliteration ON public.strongs_entries(transliteration);

-- Full-text search on definitions (for future search feature)
CREATE INDEX idx_strongs_definition_search ON public.strongs_entries
  USING gin(to_tsvector('english', definition));
