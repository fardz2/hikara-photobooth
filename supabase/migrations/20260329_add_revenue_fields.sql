    -- Migration: Add Revenue Monitoring Fields to Reservations Table
    -- Run this in Supabase SQL Editor

    -- 1. Add columns for payment and walk-in tracking
    ALTER TABLE reservations 
    ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'tunai',
    ADD COLUMN IF NOT EXISTS total_price INTEGER DEFAULT 35000,
    ADD COLUMN IF NOT EXISTS is_walk_in BOOLEAN DEFAULT false;

    -- 2. Create index for faster revenue reporting
    CREATE INDEX IF NOT EXISTS idx_reservations_revenue 
    ON reservations (date, payment_method) 
    WHERE status != 'cancelled';

    -- 3. Comment for documentation
    COMMENT ON COLUMN reservations.payment_method IS 'Metode pembayaran: tunai atau qris_manual';
    COMMENT ON COLUMN reservations.total_price IS 'Total harga transaksi dalam Rupiah';
    COMMENT ON COLUMN reservations.is_walk_in IS 'True jika transaksi dibuat langsung di lokasi (POS)';
