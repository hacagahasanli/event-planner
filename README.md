# Event Planner

A small, private event-planning app for you and whoever you invite: what, where (picked on a
map), when, and — optionally — how the cost gets split. Built with React + Vite, Tailwind +
shadcn/ui, Jotai, React Query, and Supabase as the backend.

## How login works

There's no email/password. You type a username; the app remembers it in the browser. Every
event has its own whitelist of usernames — only those people (plus whoever created it) can see
or edit that event. This is enforced in the database itself (Postgres Row Level Security), not
just hidden in the UI — see `supabase/migrations/0001_init.sql` for exactly how.

This is intentionally simple and meant for a small trusted group. There's no password, so
anyone who learns a whitelisted username can act as that person. Don't point this at a public
audience.

## One-time setup

**1. Run the database migrations.** In your Supabase project, open **SQL Editor → New query**,
paste the contents of `supabase/migrations/0001_init.sql`, and run it. This creates the three
tables (`app_users`, `events`, `event_participants`) and all the Row Level Security policies.
Then do the same with `supabase/migrations/0002_shared_todos.sql` — it adds the shared "Planlar"
checklist, hardcoded to only be visible to the usernames `hacaga` and `tunzale` (edit the list
inside `is_todo_member()` in that file if your usernames differ).

**2. Project config.** Your Supabase URL and publishable (anon) key are hardcoded in
`src/shared/config/env.ts` — no `.env` file needed. That key is meant to be public (it's what
ends up in the browser bundle either way); it has no power beyond what the RLS policies allow.
**Never** put the `sb_secret_...` service-role key anywhere in this app — it bypasses every RLS
policy above, so shipping it in the browser bundle would let anyone read/edit everything
regardless of whitelist.

**3. Install and run:**

```bash
npm install
npm run dev
```

Open the printed local URL, type any username, and you're in. The first event you create makes
you its creator; add other usernames to its whitelist from the event page so they can see it
too (an unknown username gets registered automatically the first time it's used, so you can add
a friend before they've ever opened the app).

## Project structure (Feature-Sliced Design)

```
src/
  app/          providers (React Query, router), root App component
  pages/        route-level screens (login, events list, event detail)
  widgets/      composed UI blocks (header, event card, event list)
  features/     one user action each (login, event form, location picker, whitelist editor)
  entities/     domain models + class-based services + React Query hooks
    session/    username "auth", app_users table
    event/      events table, cost-split math
    participant/ event_participants table (the whitelist)
    todo/       shared_todos table (the "Planlar" checklist)
  shared/       supabase client, env config, generic utils
  components/ui shadcn/ui primitives (kept at the conventional path so `npx shadcn add ...` still works)
```

Each entity's `model/*-service.ts` is a small class wrapping the relevant Supabase table (e.g.
`EventsService`, `ParticipantsService`, `AuthService`) — all reads/writes go through these, and
React Query hooks (`use-events.ts`, `use-participants.ts`) sit on top for caching/mutations.

## Location picking

Uses Leaflet + OpenStreetMap tiles for the map and OpenStreetMap's free Nominatim API for
address search / reverse geocoding — no API key needed anywhere. Click the map or search an
address; the marker is draggable to fine-tune the spot.

## Cost splitting

Per event you can choose: don't split, split evenly among whoever's marked as a payer, or set a
custom amount per person. Nothing here processes real payments — it's just a shared "who owes
what" breakdown.

## Deploying

This is a static Vite app — `npm run build` produces a `dist/` folder deployable anywhere
(Vercel, Netlify, Cloudflare Pages, GitHub Pages, etc.). Set the same two `VITE_SUPABASE_*`
environment variables in whichever host you pick.
