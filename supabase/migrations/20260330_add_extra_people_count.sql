-- Migration: Add extra_people_count to reservations table
-- Created: 2026-03-30

ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS extra_people_count INTEGER DEFAULT 0;

COMMENT ON COLUMN reservations.extra_people_count IS 'Jumlah orang tambahan di luar paket utama (base 4 orang)';
