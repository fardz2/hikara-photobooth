-- Migration: Add payment fields and storage bucket
-- Created: 2026-03-30

-- 1. Tambahkan kolom payment di tabel reservations
alter table reservations 
add column if not exists payment_method text check (payment_method in ('tunai', 'qris')),
add column if not exists payment_proof_url text;

-- 2. Buat bucket storage untuk bukti pembayaran jika belum ada
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', true)
on conflict (id) do nothing;

-- 3. Set up Storage Policies (RLS)
-- Allow public upload (only for payments)
drop policy if exists "Public Upload Payment Proof" on storage.objects;
create policy "Public Upload Payment Proof"
on storage.objects for insert
with check (bucket_id = 'payment-proofs');

-- Allow public read (to verify proofs)
drop policy if exists "Public Read Payment Proof" on storage.objects;
create policy "Public Read Payment Proof"
on storage.objects for select
using (bucket_id = 'payment-proofs');

-- Allow admin full access
drop policy if exists "Admin Full Access Payment Proof" on storage.objects;
create policy "Admin Full Access Payment Proof"
on storage.objects for all
using (bucket_id = 'payment-proofs' and auth.role() = 'authenticated');
