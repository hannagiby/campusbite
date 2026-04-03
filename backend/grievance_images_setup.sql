-- Run this in your Supabase SQL Editor to add image support to grievances

-- 1. Add image_urls column to the grievances table
ALTER TABLE grievances ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';

-- 2. Create the storage bucket for grievance images
INSERT INTO storage.buckets (id, name, public)
VALUES ('grievance_images', 'grievance_images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Allow anyone to view grievance images (SELECT)
CREATE POLICY "Public View Grievance Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'grievance_images');

-- 4. Allow anyone to upload grievance images (INSERT)
CREATE POLICY "Public Upload Grievance Images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'grievance_images');

-- 5. Allow updating grievance images (UPDATE)
CREATE POLICY "Public Update Grievance Images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'grievance_images');
