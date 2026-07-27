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

-- ============================================================
-- 4. Events
-- ============================================================
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date not null,
  event_time time,
  description text,
  status text not null default 'upcoming' check (status in ('upcoming', 'logged')),
  created_at timestamptz not null default now()
);

alter table events enable row level security;

-- Anyone can view events (upcoming list + history, for all members)
create policy "Public can view events"
  on events for select
  using (true);

-- Anyone can create an event. There's no real login system on this site, so the
-- "mods/admin only" rule for creating + logging events is enforced client-side with
-- a shared password (see js/events.js) rather than by the database. Anyone who has
-- the anon key could technically bypass it -- same trust model as the rest of the site.
create policy "Public can create events"
  on events for insert
  with check (true);

-- Needed so the "log this event" step can flip status from upcoming -> logged
create policy "Public can update events"
  on events for update
  using (true);

-- 5. Event participants -- who joined which event
create table if not exists event_participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  card_id uuid not null references cards(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (event_id, card_id)
);

alter table event_participants enable row level security;

create policy "Public can view event participants"
  on event_participants for select
  using (true);

create policy "Public can add event participants"
  on event_participants for insert
  with check (true);

-- Needed so re-logging an event (changing who joined) can clear old entries
create policy "Public can remove event participants"
  on event_participants for delete
  using (true);
<<<<<<< HEAD

-- ============================================================
-- 6. Character archetype (soldier / poet / ruler)
-- ============================================================
alter table cards add column if not exists archetype text check (archetype in ('soldier', 'poet', 'ruler'));
=======
>>>>>>> 2b3bf417b9a146ec967cc3764a0bb2985e0820a4
