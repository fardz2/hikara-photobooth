-- Add pricing_snapshot column to reservations table
alter table reservations add column if not exists pricing_snapshot jsonb;
