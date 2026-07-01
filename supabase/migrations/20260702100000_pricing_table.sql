-- Create dedicated pricing table (replacing JSONB in site_content)
CREATE TABLE public.pricing_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  price integer NOT NULL,
  max_people integer,
  note text,
  category text NOT NULL DEFAULT 'package' CHECK (category IN ('package', 'extra', 'addon')),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Migrate existing data from site_content JSONB
INSERT INTO public.pricing_items (label, price, max_people, note, category, sort_order)
SELECT
  item->>'label',
  (item->>'price')::integer,
  CASE WHEN item->>'maxPeople' IS NOT NULL THEN (item->>'maxPeople')::integer ELSE NULL END,
  item->>'note',
  COALESCE(item->>'category', 'package'),
  (row_number() OVER ())::integer
FROM site_content,
  jsonb_array_elements(value::jsonb) AS item
WHERE section = 'pricing' AND key = 'items';

-- Remove pricing from site_content
DELETE FROM site_content WHERE section = 'pricing';

-- RLS
ALTER TABLE public.pricing_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read pricing"
  ON public.pricing_items FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage pricing"
  ON public.pricing_items FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index
CREATE INDEX idx_pricing_items_category ON public.pricing_items (category);
CREATE INDEX idx_pricing_items_sort ON public.pricing_items (sort_order);

-- Trigger: auto-update updated_at
CREATE OR REPLACE FUNCTION update_pricing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pricing_items_updated_at
  BEFORE UPDATE ON public.pricing_items
  FOR EACH ROW EXECUTE FUNCTION update_pricing_updated_at();
