-- Add index to speed up sermon note lookups by passage
-- Migration: 00004_add_sermon_notes_passage_reference_index.sql

CREATE INDEX IF NOT EXISTS idx_sermon_notes_passage_reference
  ON public.sermon_notes (passage_reference);
