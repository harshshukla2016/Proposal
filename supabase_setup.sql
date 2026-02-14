-- SUPABASE DATABASE SCHEMA FOR GALACTIC MEMORY ODYSSEY

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Create PROPOSALS Table
create table proposals (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid default auth.uid(), -- Optional: link to auth user if using auth
  partner_name text not null,
  token text unique not null,
  nebula_color text default '#5a006c' not null,
  star_color text default '#e0e0e0' not null,
  created_at timestamp with time zone default now()
);

-- 3. Create MEMORY_CRYSTALS Table
create table memory_crystals (
  id uuid primary key default uuid_generate_v4(),
  proposal_id uuid references proposals(id) on delete cascade not null,
  image_url text,
  caption_text text not null,
  order_index integer not null,
  collected boolean default false not null,
  created_at timestamp with time zone default now()
);

-- 4. Enable Row Level Security (RLS)
alter table proposals enable row level security;
alter table memory_crystals enable row level security;

-- 5. Create Policies (Open access for demo purposes, restrict in production)
-- Allow public read/write access for simplicity in this demo
create policy "Enable read access for all users" on proposals for select using (true);
create policy "Enable insert access for all users" on proposals for insert with check (true);
create policy "Enable update access for all users" on proposals for update using (true);

create policy "Enable read access for all users" on memory_crystals for select using (true);
create policy "Enable insert access for all users" on memory_crystals for insert with check (true);
create policy "Enable update access for all users" on memory_crystals for update using (true);

-- 6. Storage Bucket for Images
insert into storage.buckets (id, name, public) 
values ('memory-images', 'memory-images', true)
on conflict (id) do nothing;

create policy "Give public access to memory-images"
on storage.objects for select
using ( bucket_id = 'memory-images' );

create policy "Allow uploads to memory-images"
on storage.objects for insert
with check ( bucket_id = 'memory-images' );
