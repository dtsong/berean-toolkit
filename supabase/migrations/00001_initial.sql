-- Initial Berean Toolkit Database Schema
-- Migration: 00001_initial.sql

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  preferred_translation TEXT DEFAULT 'ESV',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Berean Challenge: Question Bank
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mode TEXT NOT NULL CHECK (mode IN ('verse_detective', 'context_clues', 'word_connections')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  verse_reference TEXT NOT NULL,
  question_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  incorrect_answers JSONB NOT NULL DEFAULT '[]',
  strongs_number TEXT,  -- For word connection questions
  explanation TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Berean Challenge: User Progress
CREATE TABLE public.game_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  mode TEXT NOT NULL,
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_played_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, mode)
);

-- Daily Challenge
CREATE TABLE public.daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date DATE UNIQUE NOT NULL,
  question_id UUID REFERENCES public.questions(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Challenge Attempts
CREATE TABLE public.daily_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_date DATE NOT NULL,
  attempts INTEGER NOT NULL,
  solved BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_date)
);

-- Sermon Notes
CREATE TABLE public.sermon_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  passage_reference TEXT NOT NULL,
  sermon_title TEXT,
  sermon_date DATE,
  generated_outline JSONB,
  user_notes TEXT,
  reflection_answers JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sermon_notes ENABLE ROW LEVEL SECURITY;

-- Policies: Users can view and update own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies: Users can manage own game progress
CREATE POLICY "Users can view own game progress" ON public.game_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game progress" ON public.game_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own game progress" ON public.game_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies: Users can manage own daily attempts
CREATE POLICY "Users can view own daily attempts" ON public.daily_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily attempts" ON public.daily_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily attempts" ON public.daily_attempts
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies: Users can manage own sermon notes
CREATE POLICY "Users can view own sermon notes" ON public.sermon_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sermon notes" ON public.sermon_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sermon notes" ON public.sermon_notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sermon notes" ON public.sermon_notes
  FOR DELETE USING (auth.uid() = user_id);

-- Policies: Anyone can view verified questions and daily challenges
CREATE POLICY "Anyone can view verified questions" ON public.questions
  FOR SELECT USING (verified = TRUE);

CREATE POLICY "Anyone can view daily challenges" ON public.daily_challenges
  FOR SELECT USING (TRUE);

-- Indexes for performance
CREATE INDEX idx_questions_mode_difficulty ON public.questions(mode, difficulty);
CREATE INDEX idx_questions_verified ON public.questions(verified);
CREATE INDEX idx_game_progress_user ON public.game_progress(user_id);
CREATE INDEX idx_daily_challenges_date ON public.daily_challenges(challenge_date);
CREATE INDEX idx_sermon_notes_user ON public.sermon_notes(user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_progress_updated_at
  BEFORE UPDATE ON public.game_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sermon_notes_updated_at
  BEFORE UPDATE ON public.sermon_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
