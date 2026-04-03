-- ============================================================
-- CampusBite: SIMPLIFIED Orders & Token System Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Token Counter Table
CREATE TABLE IF NOT EXISTS token_counter (
  id INTEGER PRIMARY KEY DEFAULT 1,
  current_count INTEGER NOT NULL DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE
);

-- Initialize the counter
INSERT INTO token_counter (id, current_count, last_reset_date)
VALUES (1, 0, CURRENT_DATE)
ON CONFLICT (id) DO NOTHING;

-- 2. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token_number TEXT NOT NULL,
  user_name TEXT,
  user_username TEXT,
  user_email TEXT,
  items JSONB NOT NULL,
  total_amount NUMERIC NOT NULL,
  razorpay_order_id TEXT NOT NULL,
  razorpay_payment_id TEXT NOT NULL,
  razorpay_signature TEXT,
  status TEXT DEFAULT 'Confirmed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Disable RLS so queries work without auth
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_counter ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all select on orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow all insert on orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all select on token_counter" ON token_counter FOR SELECT USING (true);
CREATE POLICY "Allow all update on token_counter" ON token_counter FOR UPDATE USING (true);
