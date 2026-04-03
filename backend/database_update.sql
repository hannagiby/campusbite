-- =========================================================================
-- CampusBite: ATOMIC ORDER PROCESSING
-- This script adds a robust PostgreSQL function to handle stock check,
-- stock deduction, token generation, and order creation in one transaction.
-- Run this in your Supabase SQL Editor.
-- =========================================================================

CREATE OR REPLACE FUNCTION place_order_atomic(
  p_user_name TEXT,
  p_user_username TEXT,
  p_user_email TEXT,
  p_items JSONB,
  p_total_amount NUMERIC,
  p_razorpay_order_id TEXT,
  p_razorpay_payment_id TEXT,
  p_razorpay_signature TEXT
) RETURNS JSONB AS $$
DECLARE
  v_item RECORD;
  v_new_count INTEGER;
  v_token_number TEXT;
  v_order_id UUID;
  v_today DATE := CURRENT_DATE;
BEGIN
  -- 1. Atomic Stock Check & Deduction
  -- We loop through the items provided in the JSONB array.
  -- Each item MUST have 'id' (UUID) and 'quantity' (INTEGER).
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(id UUID, quantity INTEGER, food_name TEXT)
  LOOP
    -- Lock the specific menu item row for update to prevent concurrent deductions
    IF NOT EXISTS (
      SELECT 1 FROM menu_items WHERE id = v_item.id AND slots >= v_item.quantity FOR UPDATE
    ) THEN
      RAISE EXCEPTION 'Insufficient stock for %', v_item.food_name;
    END IF;

    -- Deduct the stock
    UPDATE menu_items
    SET slots = slots - v_item.quantity
    WHERE id = v_item.id;
  END LOOP;

  -- 2. Atomic Token Generation
  -- Lock the token counter row for the entire transaction to ensure strict incrementality
  SELECT current_count INTO v_new_count FROM token_counter WHERE id = 1 FOR UPDATE;
  
  -- Handle counter reset for a new day
  IF (SELECT last_reset_date FROM token_counter WHERE id = 1) != v_today THEN
    v_new_count := 1;
    UPDATE token_counter 
    SET current_count = v_new_count, last_reset_date = v_today 
    WHERE id = 1;
  ELSE
    v_new_count := v_new_count + 1;
    UPDATE token_counter 
    SET current_count = v_new_count 
    WHERE id = 1;
  END IF;

  -- Format: TK001, TK002, etc.
  v_token_number := 'TK' || LPAD(v_new_count::TEXT, 3, '0');

  -- 3. Insert into Orders Table
  INSERT INTO orders (
    token_number, 
    user_name, 
    user_username, 
    user_email, 
    items, 
    total_amount, 
    razorpay_order_id, 
    razorpay_payment_id, 
    razorpay_signature, 
    status,
    created_at
  ) VALUES (
    v_token_number, 
    p_user_name, 
    p_user_username, 
    p_user_email, 
    p_items, 
    p_total_amount,
    p_razorpay_order_id, 
    p_razorpay_payment_id, 
    p_razorpay_signature, 
    'Confirmed',
    NOW()
  ) RETURNING id INTO v_order_id;

  -- 4. Return the result
  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'token_number', v_token_number,
    'status', 'success',
    'timestamp', NOW()
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Rollback happens automatically on exception in PL/pgSQL
    RETURN jsonb_build_object(
      'status', 'error',
      'message', SQLERRM
    );
END;
$$ LANGUAGE plpgsql;
