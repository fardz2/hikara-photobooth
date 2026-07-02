-- Migration: Harden payment-proofs bucket security
-- Created: 2026-07-02

-- 1. Update bucket: add file_size_limit (5MB) and allowed_mime_types
update storage.buckets
set file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'payment-proofs';

-- 2. Drop overly permissive public insert policy
drop policy if exists "Public Upload Payment Proof" on storage.objects;

-- 3. Replace with auth-gated insert policy
create policy "Authenticated Upload Payment Proof"
on storage.objects for insert
to authenticated
with check (bucket_id = 'payment-proofs');
