-- Migration to add performance indexes for reservations searching and sorting
-- Created: 2026-04-01

-- 1. Enable pg_trgm extension for partial string search (ilike)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Add GIN Trigram index for customer name searching
-- Optimized for: where name ilike '%search%'
CREATE INDEX IF NOT EXISTS idx_reservations_name_trgm 
ON reservations USING gin (name gin_trgm_ops);

-- 3. Add Composite B-tree index for dashboard sorting and filtering
-- Optimized for: where status = '...' and date between '...' order by date desc, time asc
CREATE INDEX IF NOT EXISTS idx_reservations_status_date_time 
ON reservations (status, date DESC, time ASC);

-- 4. Add index for general date-time sorting (when status is "all")
CREATE INDEX IF NOT EXISTS idx_reservations_date_time_sort
ON reservations (date DESC, time ASC);
