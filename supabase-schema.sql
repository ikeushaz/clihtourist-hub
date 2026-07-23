-- ============================================================
-- Friend Group Hub — Supabase schema
-- Run this once in your Supabase project: Dashboard → SQL Editor → New query → paste → Run
-- ============================================================

-- 1. Table that stores every member card
create table if not exists cards (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  pronouns text,
  discord_username text not null,
  role text not null default 'member' check (role in ('member', 'mod', 'owner')),
  lore text,
  color text not null default '#8b7fd6',
  avatar_url text,
  stat_activeness int not null default 50 check (stat_activeness between 0 and 100),
  stat_gaming int not null default 50 check (stat_gaming between 0 and 100),
  stat_gayness int not null default 50 check (stat_gayness between 0 and 100),
  created_at timestamptz not null default now()
);

-- 2. Lock the table down with Row Level Security
alter table cards enable row level security;

-- Anyone (including anonymous visitors using the public anon key) can read all cards
create policy "Public can view cards"
  on cards for select
  using (true);

-- Anyone can add a NEW card (this is how members add themselves, no login needed)
create policy "Public can add a card"
  on cards for insert
  with check (true);

-- Deliberately NO update / delete policy for the public anon role.
-- That means nobody can edit or delete a card through the website —
-- only you can, from the Supabase Table Editor (Dashboard → Table Editor → cards),
-- where you're logged in as the project owner. This matches the "I'll edit it for them" workflow.

-- 3. Storage bucket for profile pictures
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Anyone can view avatar images (needed so the site can display them)
create policy "Public can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Anyone can upload an avatar (needed so members can upload their own picture when adding a card)
create policy "Public can upload avatars"
  on storage.objects for insert
  with check (bucket_id = 'avatars');
