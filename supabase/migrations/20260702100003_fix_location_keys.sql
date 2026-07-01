-- Fix location section keys to match admin settings form
-- DB has 'address' (1 key), form expects address_line1/address_line2/address_sub

-- Update the single 'address' key to match new structure
-- address_line1: "Jl. Veteran,"
-- address_line2: "Dirgahayu"
-- address_sub: "(Sebelah RM. Barokah Muka Hotel Kartika) <br /> Kec. Pulau Laut Utara, Kab. Kotabaru <br /> Kalimantan Selatan"

UPDATE public.site_content
SET key = 'address_line1', value = '"Jl. Veteran,"'
WHERE section = 'location' AND key = 'address';

INSERT INTO public.site_content (section, key, value)
VALUES
  ('location', 'address_line2', '"Dirgahayu"'),
  ('location', 'address_sub', '"(Sebelah RM. Barokah Muka Hotel Kartika) <br /> Kec. Pulau Laut Utara, Kab. Kotabaru <br /> Kalimantan Selatan"')
ON CONFLICT (section, key) DO UPDATE SET value = EXCLUDED.value;

-- Update phone/hours/map_embed_url to use JSON strings (match existing format)
UPDATE public.site_content
SET value = '"6285652046716"'
WHERE section = 'location' AND key = 'phone';

UPDATE public.site_content
SET value = '"14:00 - 23:00 (Senin - Minggu)"'
WHERE section = 'location' AND key = 'hours';

UPDATE public.site_content
SET value = '"https://maps.google.com/maps?q=Hikara.photobox%2C%20Jl.%20Veteran%2C%20Dirgahayu%2C%20Kec.%20Pulau%20Laut%20Utara%2C%20Kab.%20Kotabaru%2C%20Kalimantan%20Selatan%2072111&t=&z=16&ie=UTF8&iwloc=&output=embed"'
WHERE section = 'location' AND key = 'map_embed_url';
