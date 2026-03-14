-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  food_name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  slots INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: Depending on your RLS (Row Level Security) policies, you might need to enable RLS
-- and create policies to allow read/write access.
-- ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Enable read access for all users" ON menu_items FOR SELECT USING (true);
-- CREATE POLICY "Enable insert for authenticated users only" ON menu_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- CREATE POLICY "Enable update for authenticated users only" ON menu_items FOR UPDATE USING (auth.role() = 'authenticated');

CREATE TABLE IF NOT EXISTS food_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS food_certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
