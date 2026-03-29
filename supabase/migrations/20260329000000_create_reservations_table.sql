-- Migration: Create reservations table
-- Created: 2026-03-29

create table if not exists reservations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text not null,
  date date not null,
  time text not null,
  package text not null,
  addons text[] default '{}',
  status text default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Index untuk query berdasarkan tanggal (memudahkan cek slot availability)
create index if not exists idx_reservations_date on reservations (date);
create index if not exists idx_reservations_status on reservations (status);
create index if not exists idx_reservations_date_time on reservations (date, time);

-- Auto-update updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_reservations_updated_at on reservations;
create trigger update_reservations_updated_at
  before update on reservations
  for each row
  execute function update_updated_at_column();

-- Enable RLS (Row Level Security)
alter table reservations enable row level security;

-- Policy Cleanup
drop policy if exists "Allow public insert" on reservations;
drop policy if exists "Allow public select" on reservations;
drop policy if exists "Allow service role to select all" on reservations;
drop policy if exists "Allow service role full access" on reservations;

-- Policy: siapa saja boleh insert (public booking)
create policy "Allow public insert"
  on reservations for insert
  with check (true);

-- Policy: siapa saja boleh melihat jadwal
create policy "Allow public select"
  on reservations for select
  using (true);

-- Policy: hanya service role (admin) yang bisa full access
create policy "Allow service role full access"
  on reservations for all
  using (auth.role() = 'service_role');
