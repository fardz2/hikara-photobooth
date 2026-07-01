-- Add category to existing pricing items
-- Rules: maxPeople → package, contains "orang"/"print" → extra, rest → addon

do $$
declare
  items jsonb;
  updated jsonb := '[]'::jsonb;
  item jsonb;
  cat text;
begin
  -- Get current pricing items
  select value into items from site_content where section = 'pricing' and key = 'items';
  
  if items is null then return; end if;
  
  for item in select * from jsonb_array_elements(items)
  loop
    if (item->>'maxPeople') is not null then
      cat := 'package';
    elsif lower(item->>'label') like '%orang%' or lower(item->>'label') like '%print%' then
      cat := 'extra';
    else
      cat := 'addon';
    end if;
    
    updated := updated || (item || jsonb_build_object('category', cat));
  end loop;
  
  update site_content set value = updated where section = 'pricing' and key = 'items';
end $$;
