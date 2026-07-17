import { BaseService } from "@/shared/api/base-service"

import type { AppUser } from "./types"

interface AppUserRow {
  username: string
  display_name: string | null
  created_at: string
}

function toAppUser(row: AppUserRow): AppUser {
  return {
    username: row.username,
    displayName: row.display_name,
    createdAt: row.created_at,
  }
}

const USERNAME_PATTERN = /^[a-z0-9_.-]{2,32}$/i

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase()
}

export function isValidUsername(raw: string): boolean {
  return USERNAME_PATTERN.test(raw)
}

/**
 * Handles the "app_users" table — the global list of people allowed to open
 * the app at all. There are no passwords: knowing a valid username is enough.
 * Per-event visibility is a separate, second layer (see ParticipantsService).
 */
export class AuthService extends BaseService {
  async listUsers(): Promise<AppUser[]> {
    const { data, error } = await this.client
      .from("app_users")
      .select("username, display_name, created_at")
      .order("created_at", { ascending: true })

    this.throwIfError(error)
    return (data ?? []).map(toAppUser)
  }

  async ensureUsername(username: string, displayName?: string): Promise<AppUser> {
    const normalized = normalizeUsername(username)
    if (!isValidUsername(normalized)) {
      throw new Error(
        "Username 2-32 simvol olmalı və yalnız hərf, rəqəm, '.', '_', '-' saxlaya bilər."
      )
    }

    const { data, error } = await this.client
      .from("app_users")
      .upsert(
        { username: normalized, display_name: displayName?.trim() || normalized },
        { onConflict: "username", ignoreDuplicates: true }
      )
      .select("username, display_name, created_at")
      .maybeSingle()

    this.throwIfError(error)

    if (data) return toAppUser(data)

    // Already existed (ignoreDuplicates skipped the insert) — fetch it back.
    const { data: existing, error: fetchError } = await this.client
      .from("app_users")
      .select("username, display_name, created_at")
      .eq("username", normalized)
      .single()

    this.throwIfError(fetchError)
    return toAppUser(existing!)
  }
}

export const authService = new AuthService()
