-- Migration: Standardize payment_method to 'tunai' | 'qris' only
-- Created: 2026-04-02
-- Context: Sebelumnya ada dua nilai: 'qris' dan 'qris_manual' yang tidak konsisten.
--          Migration ini menyeragamkan ke 'qris' saja dan menambahkan CHECK constraint.

-- 1. Normalise existing data: qris_manual → qris
UPDATE reservations
SET payment_method = 'qris'
WHERE payment_method = 'qris_manual';

-- 2. Set a safe default
ALTER TABLE reservations
  ALTER COLUMN payment_method SET DEFAULT 'tunai';

-- 3. Add CHECK constraint (idempotent)
ALTER TABLE reservations
  DROP CONSTRAINT IF EXISTS reservations_payment_method_check;

ALTER TABLE reservations
  ADD CONSTRAINT reservations_payment_method_check
  CHECK (payment_method IN ('tunai', 'qris'));

-- 4. Update column comment
COMMENT ON COLUMN reservations.payment_method IS 'Metode pembayaran: tunai atau qris';
