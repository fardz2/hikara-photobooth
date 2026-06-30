-- Migration: Add site_content table for dynamic landing page content
-- Created: 2026-07-01

create table if not exists site_content (
  section text not null,
  key text not null,
  value jsonb not null default '{}',
  updated_at timestamptz default now(),
  primary key (section, key)
);

-- Auto-update updated_at
create or replace function update_site_content_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_site_content_updated_at on site_content;
create trigger update_site_content_updated_at
  before update on site_content
  for each row
  execute function update_site_content_updated_at();

-- Enable RLS
alter table site_content enable row level security;

-- Public read (landing page)
create policy "Public read site_content"
  on site_content for select
  using (true);

-- Admin write
create policy "Admin write site_content"
  on site_content for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Seed: Hero
insert into site_content (section, key, value) values
('hero', 'tagline', '"HIKARA PHOTOBOX"'),
('hero', 'title_line1', '"MOMEN KECIL,"'),
('hero', 'title_highlight', '"KENANGAN"'),
('hero', 'title_line2', '"ABADI"'),
('hero', 'subtitle', '"Photobox estetik dengan sentuhan minimalis. Tangkap versi terbaik dari dirimu."'),
('hero', 'brand_name', '"HIKARA"'),
('hero', 'vertical_text_right', '"PHOTOBOX"'),
('hero', 'vertical_text_left', '"Abadikan Momen"'),
('hero', 'cta_text', '"Book Now"'),
('hero', 'cta_link', '"/reservasi"'),
('hero', 'polaroid_1', '"https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop"'),
('hero', 'polaroid_2', '"https://images.unsplash.com/photo-1518599904199-0ca897819ddb?q=80&w=400&auto=format&fit=crop"'),
('hero', 'polaroid_3', '"https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop"')
on conflict (section, key) do nothing;

-- Seed: Marquee
insert into site_content (section, key, value) values
('marquee', 'text', '["HIKARA", "PHOTOBOX"]')
on conflict (section, key) do nothing;

-- Seed: About
insert into site_content (section, key, value) values
('about', 'image_url', '"https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop"'),
('about', 'description', '"HIKARA PHOTOBOX adalah studio foto konsep estetik minimalis modern yang berlokasi di Kotabaru, Kalimantan Selatan. Setiap sudut dirancang dengan detail untuk menciptakan pengalaman fotografi yang intim dan personal. Kami percaya bahwa setiap momen—sekecil apa pun—layak diabadikan dengan cara yang paling indah."')
on conflict (section, key) do nothing;

-- Seed: Gallery
insert into site_content (section, key, value) values
('gallery', 'images', '["https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop","https://images.unsplash.com/photo-1518599904199-0ca897819ddb?q=80&w=800&auto=format&fit=crop","https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop","https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800&auto=format&fit=crop","https://images.unsplash.com/photo-1516726817505-f5ed825624d8?q=80&w=800&auto=format&fit=crop"]')
on conflict (section, key) do nothing;

-- Seed: Themes
insert into site_content (section, key, value) values
('themes', 'items', '[{"name":"Classic Monochrome","desc":"Nuansa hitam putih abadi dengan kontras yang dramatis. Sempurna untuk ekspresi tegas dan editorial.","img":"https://images.unsplash.com/photo-1516726817505-f5ed825624d8?q=80&w=800&auto=format&fit=crop","images":["https://images.unsplash.com/photo-1516726817505-f5ed825624d8?q=80&w=300&auto=format&fit=crop"]},{"name":"Tokyo Vintage","desc":"Warna analog pudar khas cuci film 90-an. Membawa kembali kenangan hangat yang bernuansa nostalgia.","img":"https://images.unsplash.com/photo-1542051842920-c7aa7111c12e?q=80&w=800&auto=format&fit=crop","images":["https://images.unsplash.com/photo-1516726817505-f5ed825624d8?q=80&w=300&auto=format&fit=crop"]},{"name":"Soft Cinematic","desc":"Tonasi pastel hangat yang memberikan kesan dreamy. Sangat lembut dan cocok untuk momen manis berpasangan.","img":"https://images.unsplash.com/photo-1493612276216-ee3925520721?q=80&w=800&auto=format&fit=crop","images":["https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop"]}]')
on conflict (section, key) do nothing;

-- Seed: Testimonials
insert into site_content (section, key, value) values
('testimonials', 'items', '[{"quote":"Pengalaman photobox yang belum pernah ada di Kotabaru. Lightingnya benar-benar terasa seperti studio eksklusif. Sangat premium!","author":"RANI & ANDI","context":"Sesi Prewedding"},{"quote":"Suka banget sama hasil print Classic Strip-nya. Filter Tokyo Vintage benar-benar bikin foto biasa jadi estetik parah.","author":"SABRINA","context":"Sesi Graduation"},{"quote":"Tempatnya nyaman banget, privasi terjaga. Kualitas kertas cetakan tebal dan anti-luntur. Experience 10/10!","author":"KEVIN W.","context":"Family Portrait"}]')
on conflict (section, key) do nothing;

-- Seed: Pricing
insert into site_content (section, key, value) values
('pricing', 'paket_utama', '{"label":"Foto per Sesi + 2 Photostrip (Maks 3 Orang)","price":35000,"maxPeople":3,"note":"MAX. 3 ORANG"}'),
('pricing', 'extra_person', '{"label":"Tambahan per Orang","price":5000}'),
('pricing', 'extra_print', '{"label":"Extra Print","price":10000}'),
('pricing', 'custom_frame', '{"label":"Custom Frame Birthday, Dll","price":15000}')
on conflict (section, key) do nothing;

-- Seed: Location
insert into site_content (section, key, value) values
('location', 'map_embed_url', '"https://maps.google.com/maps?q=Hikara.photobox%2C%20Jl.%20Veteran%2C%20Dirgahayu%2C%20Kec.%20Pulau%20Laut%20Utara%2C%20Kab.%20Kotabaru%2C%20Kalimantan%20Selatan%2072111&t=&z=16&ie=UTF8&iwloc=&output=embed"'),
('location', 'address', '"Jl. Veteran, Dirgahayu, Kec. Pulau Laut Utara, Kab. Kotabaru, Kalimantan Selatan 72111"'),
('location', 'phone', '"6285652046716"'),
('location', 'hours', '"14:00 - 23:00 (Senin - Minggu)"')
on conflict (section, key) do nothing;

-- Seed: CTA
insert into site_content (section, key, value) values
('cta', 'title', '"Siap Mengabadikan Momen?"'),
('cta', 'description', '"Jangan biarkan momen berharga berlalu begitu saja. Abadikan bersama Hikara Photobox."'),
('cta', 'button_text', '"Book Now"'),
('cta', 'button_link', '"/reservasi"')
on conflict (section, key) do nothing;
