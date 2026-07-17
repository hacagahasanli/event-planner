import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js"

import { supabase } from "@/shared/api/supabase-client"

/**
 * Every entity service extends this. Keeps a single supabase-js client
 * reference and centralizes error handling so individual services stay
 * focused on their own table(s) and mapping logic.
 */
export abstract class BaseService {
  protected readonly client: SupabaseClient = supabase

  protected throwIfError(error: PostgrestError | null): void {
    if (error) {
      throw new Error(error.message)
    }
  }
}
