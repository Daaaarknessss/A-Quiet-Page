-- The Quiet Page — "For you" additions
-- Run this in the Supabase SQL editor after schema.sql. Safe to re-run.

-- Which poems she gets to read.
alter table poems add column if not exists shared boolean not null default false;

-- The lines that drift in, one at a time, when she opens the page.
create table if not exists moments (
  id uuid primary key default gen_random_uuid(),
  position int not null default 0,
  text text not null default '',
  -- Extra silence after this line, in milliseconds. Null = the default rhythm.
  pause_ms int,
  created_at timestamptz not null default now()
);

create index if not exists moments_position_idx on moments (position);

-- The notes she writes back.
create table if not exists replies (
  id uuid primary key default gen_random_uuid(),
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists replies_created_at_idx on replies (created_at desc);

-- Same open policy as poems for now. Once auth is added, scope writes on
-- moments/poems to auth.uid(), make replies insert-only for anon, and
-- restrict anon reads of poems to shared = true.
alter table moments enable row level security;
alter table replies enable row level security;

drop policy if exists "Allow all access" on moments;
create policy "Allow all access" on moments for all using (true) with check (true);

drop policy if exists "Allow all access" on replies;
create policy "Allow all access" on replies for all using (true) with check (true);
