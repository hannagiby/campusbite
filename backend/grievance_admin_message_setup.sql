-- Run this in your Supabase SQL Editor to add the admin_message column
ALTER TABLE grievances ADD COLUMN IF NOT EXISTS admin_message TEXT;
