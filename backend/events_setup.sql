CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  type TEXT DEFAULT 'event', -- 'event', 'closure', 'promo'
  created_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Note: In Supabase, if RLS is enabled, you need policies. 
-- Assuming RLS is either disabled or governed by service role key for API use.
