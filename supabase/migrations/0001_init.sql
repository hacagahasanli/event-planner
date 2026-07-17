-- Event Planner — initial schema
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query > paste > Run).
--
-- Auth model: there is no Supabase Auth (no email/password). Each person just
-- picks a username. The React app sends that username on every request as a
-- custom header (`x-app-username`), and Postgres Row Level Security reads it
-- back out via `request_username()` below to decide what each username is
-- allowed to see and change. This is meant for a small, trusted group (you +
-- friends/partner) — anyone who knows a whitelisted username can act as that
-- person, there is no password. Do not reuse this pattern for a public app.

-- ---------------------------------------------------------------------------
-- 1. Helper: read the current caller's username from the request headers
-- ---------------------------------------------------------------------------
create or replace function public.request_username()
returns text
language sql
stable
as $$
  select nullif(
    coalesce(current_setting('request.headers', true), '{}')::json ->> 'x-app-username',
    ''
  );
$$;

-- ---------------------------------------------------------------------------
-- 2. Tables
-- ---------------------------------------------------------------------------
create table if not exists public.app_users (
  username     text primary key,
  display_name text,
  created_at   timestamptz not null default now()
);

create table if not exists public.events (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  description    text,
  event_date     timestamptz not null,
  location_name  text,
  location_lat   double precision,
  location_lng   double precision,
  total_cost     numeric(10, 2),
  split_type     text not null default 'none' check (split_type in ('none', 'equal', 'custom')),
  created_by     text not null references public.app_users (username),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.event_participants (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events (id) on delete cascade,
  username    text not null references public.app_users (username),
  is_payer    boolean not null default true,
  share_amount numeric(10, 2),
  added_at    timestamptz not null default now(),
  unique (event_id, username)
);

create index if not exists event_participants_event_id_idx on public.event_participants (event_id);
create index if not exists event_participants_username_idx on public.event_participants (username);
create index if not exists events_event_date_idx on public.events (event_date);

-- keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. Security-definer helpers (avoid RLS recursion on event_participants)
-- ---------------------------------------------------------------------------
create or replace function public.is_event_participant(p_event_id uuid, p_username text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.event_participants ep
    where ep.event_id = p_event_id and ep.username = p_username
  );
$$;

create or replace function public.can_access_event(p_event_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.events e
    where e.id = p_event_id
      and (
        e.created_by = public.request_username()
        or public.is_event_participant(p_event_id, public.request_username())
      )
  );
$$;

-- ---------------------------------------------------------------------------
-- 4. Row Level Security
-- ---------------------------------------------------------------------------
alter table public.app_users enable row level security;
alter table public.events enable row level security;
alter table public.event_participants enable row level security;

-- app_users: usernames aren't secret, anyone using the app can see the list
-- (needed for the "pick from existing users" autocomplete) and register a
-- new one. Only the owner of a username can edit their own display name.
drop policy if exists app_users_select on public.app_users;
create policy app_users_select on public.app_users
  for select using (true);

drop policy if exists app_users_insert on public.app_users;
create policy app_users_insert on public.app_users
  for insert with check (true);

drop policy if exists app_users_update on public.app_users;
create policy app_users_update on public.app_users
  for update using (username = public.request_username());

-- events: visible to the creator and anyone whitelisted on the event.
-- Any whitelisted participant can edit; only the creator can delete.
drop policy if exists events_select on public.events;
create policy events_select on public.events
  for select using (
    created_by = public.request_username()
    or public.is_event_participant(id, public.request_username())
  );

drop policy if exists events_insert on public.events;
create policy events_insert on public.events
  for insert with check (created_by = public.request_username());

drop policy if exists events_update on public.events;
create policy events_update on public.events
  for update using (public.can_access_event(id));

drop policy if exists events_delete on public.events;
create policy events_delete on public.events
  for delete using (created_by = public.request_username());

-- event_participants: same visibility as the parent event; anyone who can
-- access the event can manage its whitelist.
drop policy if exists event_participants_select on public.event_participants;
create policy event_participants_select on public.event_participants
  for select using (public.can_access_event(event_id));

drop policy if exists event_participants_insert on public.event_participants;
create policy event_participants_insert on public.event_participants
  for insert with check (public.can_access_event(event_id));

drop policy if exists event_participants_update on public.event_participants;
create policy event_participants_update on public.event_participants
  for update using (public.can_access_event(event_id));

drop policy if exists event_participants_delete on public.event_participants;
create policy event_participants_delete on public.event_participants
  for delete using (public.can_access_event(event_id));
