-- Fix PII exposure on reservations table
-- Public SELECT leaks names, phones, payment data
-- Create a view for public booking slot queries (date/time/status only)
-- and restrict direct reservations access to authenticated users only

-- 1. Create view for public slot availability
CREATE OR REPLACE VIEW public.booked_slots AS
SELECT
  date,
  time,
  status
FROM public.reservations
WHERE status IN ('pending', 'confirmed')
  AND date >= CURRENT_DATE;

-- 2. Grant anon access to the view only
GRANT SELECT ON public.booked_slots TO anon;

-- 3. Restrict reservations table to authenticated only
-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Allow public select" ON public.reservations;

-- Create authenticated-only SELECT policy
CREATE POLICY "Allow authenticated select"
  ON public.reservations
  FOR SELECT
  TO authenticated
  USING (true);
