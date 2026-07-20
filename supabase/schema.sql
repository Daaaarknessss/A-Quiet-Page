-- The Quiet Page — database schema
-- Run this in the Supabase SQL editor for your project.

create extension if not exists "pgcrypto";

create table if not exists poems (
  id uuid primary key default gen_random_uuid(),
  title text,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists poems_created_at_idx on poems (created_at desc);

-- Keep updated_at accurate even on direct SQL updates.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists poems_set_updated_at on poems;
create trigger poems_set_updated_at
  before update on poems
  for each row
  execute function set_updated_at();

-- Row Level Security.
-- The Quiet Page is designed as a single-writer, private journal. The policies
-- below allow full access to anyone holding your anon key, which is fine for a
-- personal project only you can reach. If you ever deploy this publicly, add
-- Supabase Auth and scope these policies to auth.uid() instead.
alter table poems enable row level security;

drop policy if exists "Allow all access" on poems;
create policy "Allow all access" on poems
  for all
  using (true)
  with check (true);
