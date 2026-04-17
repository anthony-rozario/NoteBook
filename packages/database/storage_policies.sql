-- ═══════════════════════════════════════════════════════════════
-- STORAGE RLS POLICIES FOR notebook_files BUCKET
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════

-- 1. Allow authenticated users to UPLOAD to their own folder
--    Path structure: {user_id}/{notebook_id}/filename
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'notebook_files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. Allow authenticated users to UPDATE (overwrite) their own files
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'notebook_files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Allow authenticated users to DELETE their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'notebook_files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Allow ANYONE (public) to READ/VIEW files (since bucket is public)
CREATE POLICY "Public can view notebook files"
ON storage.objects FOR SELECT
USING (bucket_id = 'notebook_files');
