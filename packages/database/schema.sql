-- Complete NoteBook Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL)
-- This is the FULL schema — safe to re-run (uses IF NOT EXISTS)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Users (profiles) ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT,
  full_name TEXT,
  email TEXT UNIQUE,
  university TEXT,
  company TEXT,
  major TEXT,
  role TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── Notebooks ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'pdf', 'digital')),
  has_ai_summary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── Pages (content units) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notebook_id UUID REFERENCES public.notebooks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  position_index INTEGER DEFAULT 1,
  image_url TEXT,       -- PDF processed image
  content TEXT,         -- TipTap HTML
  ocr_text TEXT,        -- Raw extracted text for search
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── Page Collaborators (sharing) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.page_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_level TEXT CHECK (permission_level IN ('viewer', 'editor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(page_id, user_id)
);

-- ─── AI Summaries ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notebook_id UUID REFERENCES public.notebooks(id) ON DELETE CASCADE UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  summary_content TEXT,
  key_takeaways JSONB,  -- { key_takeaways: [], topics: [], question_paper: [] }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ─── Enable RLS ────────────────────────────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_summaries ENABLE ROW LEVEL SECURITY;

-- ─── RLS Policies ──────────────────────────────────────────────────────────

-- Users table
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = user_id);

-- Notebooks table
DROP POLICY IF EXISTS "Users own notebooks" ON public.notebooks;
CREATE POLICY "Users own notebooks" ON public.notebooks FOR ALL USING (auth.uid() = user_id);

-- Pages table
DROP POLICY IF EXISTS "Users own pages" ON public.pages;
CREATE POLICY "Users own pages" ON public.pages FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Collab view pages" ON public.pages;
CREATE POLICY "Collab view pages" ON public.pages FOR SELECT USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM public.page_collaborators WHERE page_id = pages.id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Collab edit pages" ON public.pages;
CREATE POLICY "Collab edit pages" ON public.pages FOR UPDATE USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.page_collaborators 
    WHERE page_id = pages.id AND user_id = auth.uid() AND permission_level = 'editor'
  )
);

-- Page collaborators
DROP POLICY IF EXISTS "Users manage their collab entries" ON public.page_collaborators;
CREATE POLICY "Users manage their collab entries" ON public.page_collaborators FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.pages p 
      JOIN public.notebooks nb ON p.notebook_id = nb.id
      WHERE p.id = page_id AND nb.user_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

-- AI Summaries
DROP POLICY IF EXISTS "Users own ai summaries" ON public.ai_summaries;
CREATE POLICY "Users own ai summaries" ON public.ai_summaries FOR ALL USING (auth.uid() = user_id);

-- ─── Indexes ───────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_notebooks_user_id ON public.notebooks(user_id);
CREATE INDEX IF NOT EXISTS idx_pages_notebook_id ON public.pages(notebook_id);
CREATE INDEX IF NOT EXISTS idx_pages_position ON public.pages(notebook_id, position_index);
CREATE INDEX IF NOT EXISTS idx_collaborators_page_id ON public.page_collaborators(page_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_user_id ON public.page_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_summaries_notebook_id ON public.ai_summaries(notebook_id);
CREATE INDEX IF NOT EXISTS idx_ai_summaries_user_id ON public.ai_summaries(user_id);

-- ─── updated_at trigger function ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_notebooks_updated_at ON public.notebooks;
CREATE TRIGGER update_notebooks_updated_at
  BEFORE UPDATE ON public.notebooks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_pages_updated_at ON public.pages;
CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_summaries_updated_at ON public.ai_summaries;
CREATE TRIGGER update_ai_summaries_updated_at
  BEFORE UPDATE ON public.ai_summaries FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ─── AUTO-CREATE USER PROFILE ON SIGNUP ───────────────────────────────────
-- This trigger fires after a new auth.users row is inserted (i.e., after signup)
-- and automatically creates a matching row in public.users

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (user_id, name, email, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (user_id) DO NOTHING;  -- Safe if row already exists
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ─── STORAGE BUCKET (if not created) ─────────────────────────────────────
-- Run this separately or in Storage section of Supabase Dashboard:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('notebook_files', 'notebook_files', true) ON CONFLICT DO NOTHING;
