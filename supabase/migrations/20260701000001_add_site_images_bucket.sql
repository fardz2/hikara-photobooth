-- Migration: Add site-images storage bucket for settings page uploads
-- Limits: max 3 images per gallery, max 2MB per file

-- 1. Buat bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-images',
  'site-images',
  true,
  2097152, -- 2MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

-- 2. RLS: authenticated can upload/delete
drop policy if exists "Admin upload site images" on storage.objects;
create policy "Admin upload site images"
  on storage.objects for insert
  with check (
    auth.role() = 'authenticated'
    and bucket_id = 'site-images'
  );

drop policy if exists "Admin update site images" on storage.objects;
create policy "Admin update site images"
  on storage.objects for update
  using (auth.role() = 'authenticated' and bucket_id = 'site-images');

drop policy if exists "Admin delete site images" on storage.objects;
create policy "Admin delete site images"
  on storage.objects for delete
  using (auth.role() = 'authenticated' and bucket_id = 'site-images');

-- 3. Public read (landing page needs to display them)
drop policy if exists "Public read site images" on storage.objects;
create policy "Public read site images"
  on storage.objects for select
  using (bucket_id = 'site-images');
