function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env and fill in your Supabase project values.`
    )
  }
  return value
}

export const env = {
  supabaseUrl: requireEnv(
    "VITE_SUPABASE_URL",
    import.meta.env.VITE_SUPABASE_URL as string | undefined
  ),
  supabasePublishableKey: requireEnv(
    "VITE_SUPABASE_PUBLISHABLE_KEY",
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined
  ),
}

export const USERNAME_HEADER = "x-app-username"
export const SESSION_STORAGE_KEY = "event-planner:username"
