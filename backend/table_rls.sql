-- Run this in your Supabase SQL Editor to allow the app to save categories!

-- Enable Row Level Security (RLS) on the food_categories table
ALTER TABLE food_categories ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow ANYONE to read the categories (for the dropdown)
CREATE POLICY "Enable read access for all users" 
ON food_categories FOR SELECT USING (true);

-- Create a policy to allow ANYONE to insert new categories
CREATE POLICY "Enable insert access for all users" 
ON food_categories FOR INSERT WITH CHECK (true);

-- Let's also make sure the menu_items table has open access so you don't get stuck there next!
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all" 
ON menu_items FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all" 
ON menu_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all" 
ON menu_items FOR UPDATE USING (true);
