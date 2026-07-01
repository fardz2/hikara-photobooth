-- Add extras JSONB column to reservations table
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS extras jsonb;
