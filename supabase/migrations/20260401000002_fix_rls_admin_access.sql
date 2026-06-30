-- Migration: Fix RLS for authenticated admins
-- Created: 2026-04-01

-- 1. Drop the restrictive service_role policy
drop policy if exists "Allow service role full access" on reservations;

-- 2. Create a new policy to allow authenticated users (Admins) to perform all actions
-- This ensures that logged-in admins can update status and delete records.
create policy "Allow authenticated admins full access"
  on reservations for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
