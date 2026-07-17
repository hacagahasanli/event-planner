// Supabase project config — hardcoded on purpose. This is the *publishable*
// (anon) key, which is designed to be public and shipped in client bundles;
// it has no power beyond what Row Level Security allows (see
// supabase/migrations/0001_init.sql). Never put the secret/service-role key
// here — that one bypasses RLS entirely.
export const env = {
  supabaseUrl: "https://yvpbpwkblncniwwvscds.supabase.co",
  supabasePublishableKey: "sb_publishable_T4Vegi79nBJCYZFSTv0MyQ_Q7DsRgFI",
}

export const USERNAME_HEADER = "x-app-username"
export const SESSION_STORAGE_KEY = "event-planner:username"
