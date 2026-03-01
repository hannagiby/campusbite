-- Run this in your Supabase SQL Editor to fix the image upload error!

-- 1. First, create the storage bucket if it doesn't already exist and make it public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('food_images', 'food_images', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Allow anyone to view the images (SELECT)
CREATE POLICY "Public View Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'food_images');

-- 3. Allow anyone to upload new images (INSERT)
CREATE POLICY "Public Upload Access" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'food_images');

-- 4. Allow updating existing images (UPDATE)
CREATE POLICY "Public Update Access" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'food_images');
