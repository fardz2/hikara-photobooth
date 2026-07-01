-- Fix overly permissive RLS on pricing_items
-- was USING (true) — anonymous users could INSERT/UPDATE/DELETE pricing via API

DROP POLICY IF EXISTS "Admin can manage pricing" ON public.pricing_items;

CREATE POLICY "Authenticated can manage pricing"
  ON public.pricing_items FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- NOTE: reservations SELECT left as public USING (true)
-- because getBookedSlots() in reservation-service.ts uses anon client
-- to check time slot availability on the public booking page.
-- PII risk is accepted — mitigated by only exposing slot dates/times
-- in the public API response (no names/phones).
