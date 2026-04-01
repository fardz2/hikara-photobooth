-- Migration: Add extra_print_count to reservations table
-- Created: 2026-04-01

ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS extra_print_count INTEGER DEFAULT 0;

COMMENT ON COLUMN reservations.extra_print_count IS 'Jumlah lembar cetak tambahan di luar paket utama (base 2 photostrip)';
