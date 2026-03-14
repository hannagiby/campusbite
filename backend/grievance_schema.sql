-- Run this in your Supabase SQL Editor to create the grievances table

CREATE TABLE IF NOT EXISTS grievances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  details TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  submitted_by_name TEXT,
  submitted_by_username TEXT,
  submitted_by_email TEXT,
  submitted_by_role TEXT,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable public access (adjust as needed for your RLS policies)
-- ALTER TABLE grievances ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Enable read access for all users" ON grievances FOR SELECT USING (true);
-- CREATE POLICY "Enable insert for all users" ON grievances FOR INSERT WITH CHECK (true);
