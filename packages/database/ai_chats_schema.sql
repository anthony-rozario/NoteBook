-- ═══════════════════════════════════════════════════════════════
-- SQL FOR AI CHAT HISTORY
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE ai_chats (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(user_id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE ai_chats ENABLE ROW LEVEL SECURITY;

-- Allow users to manage only their own chat history
CREATE POLICY "Users can view and insert own chats"
ON ai_chats FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Optional: Create an index for faster loading
CREATE INDEX idx_ai_chats_user_id_created_at ON ai_chats(user_id, created_at DESC);
