-- Convert per-key pricing rows to single items array
do $$
declare
  items jsonb := '[]'::jsonb;
  row record;
begin
  -- Build array from existing per-key rows
  for row in
    select key, value from site_content
    where section = 'pricing' and key != 'items'
    order by key
  loop
    items := items || jsonb_build_array(
      jsonb_build_object(
        'label', row.value->>'label',
        'price', (row.value->>'price')::numeric,
        'maxPeople', case when row.value->>'maxPeople' is not null
                     then (row.value->>'maxPeople')::numeric else null end,
        'note', row.value->>'note'
      )
    );
  end loop;

  -- Only insert if we have data
  if jsonb_array_length(items) > 0 then
    insert into site_content (section, key, value)
    values ('pricing', 'items', items)
    on conflict (section, key) do update set value = excluded.value;

    -- Remove old per-key rows
    delete from site_content
    where section = 'pricing' and key != 'items';
  end if;
end;
$$;
