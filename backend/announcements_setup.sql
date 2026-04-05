-- Run this in your Supabase SQL Editor to create the announcements table

CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',       -- 'info', 'warning', 'urgent'
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Allow public access (same pattern as other tables)
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on announcements"
  ON announcements FOR ALL
  USING (true)
  WITH CHECK (true);
