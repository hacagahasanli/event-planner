import { createClient } from "@supabase/supabase-js"

import { env, USERNAME_HEADER } from "@/shared/config/env"

/**
 * There is no Supabase Auth session here — logging in just means "type a
 * username". Every request needs to carry that username so Postgres Row
 * Level Security (see supabase/migrations/0001_init.sql) can decide what's
 * visible. Because the supabase-js client is created once, we inject the
 * header per-request via a custom `fetch`, reading whatever username is
 * "active" at call time. `setActiveUsername` is called by the session layer
 * whenever the user logs in/out.
 */
let activeUsername: string | null = null

export function setActiveUsername(username: string | null): void {
  activeUsername = username
}

export function getActiveUsername(): string | null {
  return activeUsername
}

const usernameAwareFetch: typeof fetch = (input, init = {}) => {
  const headers = new Headers(init.headers)
  if (activeUsername) {
    headers.set(USERNAME_HEADER, activeUsername)
  }
  return fetch(input, { ...init, headers })
}

export const supabase = createClient(env.supabaseUrl, env.supabasePublishableKey, {
  auth: { persistSession: false },
  global: { fetch: usernameAwareFetch },
})
