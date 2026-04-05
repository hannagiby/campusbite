-- ============================================================
-- CampusBite: Order Ratings & Feedback Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Order Ratings Table
CREATE TABLE IF NOT EXISTS order_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_username TEXT NOT NULL,
  user_name TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  food_quality INTEGER CHECK (food_quality >= 1 AND food_quality <= 5),
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(order_id)  -- One rating per order
);

-- 2. Enable RLS
ALTER TABLE order_ratings ENABLE ROW LEVEL SECURITY;

-- 3. Policies
CREATE POLICY "Allow all select on order_ratings" ON order_ratings FOR SELECT USING (true);
CREATE POLICY "Allow all insert on order_ratings" ON order_ratings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on order_ratings" ON order_ratings FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on order_ratings" ON order_ratings FOR DELETE USING (true);
