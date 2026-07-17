-- Shared "what we'll do next" checklist — a single list, visible only to
-- the two of you. Run this in the Supabase SQL Editor after 0001_init.sql.
-- If your two usernames aren't "hacaga" and "tunzale", edit the list inside
-- is_todo_member() below before running.

create table if not exists public.shared_todos (
  id         uuid primary key default gen_random_uuid(),
  text       text not null,
  is_done    boolean not null default false,
  created_by text not null references public.app_users (username),
  created_at timestamptz not null default now(),
  done_at    timestamptz
);

create index if not exists shared_todos_sort_idx on public.shared_todos (is_done, created_at);

alter table public.shared_todos enable row level security;

create or replace function public.is_todo_member(p_username text)
returns boolean
language sql
stable
as $$
  select p_username in ('hacaga', 'tunzale');
$$;

drop policy if exists shared_todos_select on public.shared_todos;
create policy shared_todos_select on public.shared_todos
  for select using (public.is_todo_member(public.request_username()));

drop policy if exists shared_todos_insert on public.shared_todos;
create policy shared_todos_insert on public.shared_todos
  for insert with check (
    public.is_todo_member(public.request_username())
    and created_by = public.request_username()
  );

drop policy if exists shared_todos_update on public.shared_todos;
create policy shared_todos_update on public.shared_todos
  for update using (public.is_todo_member(public.request_username()));

drop policy if exists shared_todos_delete on public.shared_todos;
create policy shared_todos_delete on public.shared_todos
  for delete using (public.is_todo_member(public.request_username()));
