-- Migration: Add Admin Update Policy
-- Created: 2026-03-30
-- Description: Allow authenticated users (Admin) to update reservation status

-- Drop existing restricted policy if it exists (for idempontency during manual runs)
DROP POLICY IF EXISTS "Allow authenticated users to update reservations" ON reservations;

-- Create the new policy with auth check
CREATE POLICY "Allow authenticated users to update reservations"
ON reservations
FOR UPDATE
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
