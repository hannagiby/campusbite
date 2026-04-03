-- Run this in your Supabase SQL Editor to add the notified tracker column
ALTER TABLE grievances ADD COLUMN IF NOT EXISTS notified BOOLEAN DEFAULT false;
