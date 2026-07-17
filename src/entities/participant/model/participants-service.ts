import { BaseService } from "@/shared/api/base-service"

import type { Participant } from "./types"

interface ParticipantRow {
  id: string
  event_id: string
  username: string
  is_payer: boolean
  share_amount: number | null
  added_at: string
}

function toParticipant(row: ParticipantRow): Participant {
  return {
    id: row.id,
    eventId: row.event_id,
    username: row.username,
    isPayer: row.is_payer,
    shareAmount: row.share_amount === null ? null : Number(row.share_amount),
    addedAt: row.added_at,
  }
}

const COLUMNS = "id, event_id, username, is_payer, share_amount, added_at"

/**
 * Handles the per-event whitelist ("event_participants"). Adding someone here
 * is what makes an event visible to their username — see the RLS policies in
 * supabase/migrations/0001_init.sql. Assumes the username already exists in
 * app_users (call AuthService.ensureUsername first for brand-new names).
 */
export class ParticipantsService extends BaseService {
  async listByEvent(eventId: string): Promise<Participant[]> {
    const { data, error } = await this.client
      .from("event_participants")
      .select(COLUMNS)
      .eq("event_id", eventId)
      .order("added_at", { ascending: true })

    this.throwIfError(error)
    return (data ?? []).map(toParticipant)
  }

  async add(eventId: string, username: string, isPayer = true): Promise<Participant> {
    const { data, error } = await this.client
      .from("event_participants")
      .insert({ event_id: eventId, username, is_payer: isPayer })
      .select(COLUMNS)
      .single()

    this.throwIfError(error)
    return toParticipant(data!)
  }

  async setShare(participantId: string, shareAmount: number | null): Promise<void> {
    const { error } = await this.client
      .from("event_participants")
      .update({ share_amount: shareAmount })
      .eq("id", participantId)

    this.throwIfError(error)
  }

  async setIsPayer(participantId: string, isPayer: boolean): Promise<void> {
    const { error } = await this.client
      .from("event_participants")
      .update({ is_payer: isPayer })
      .eq("id", participantId)

    this.throwIfError(error)
  }

  async remove(participantId: string): Promise<void> {
    const { error } = await this.client
      .from("event_participants")
      .delete()
      .eq("id", participantId)

    this.throwIfError(error)
  }
}

export const participantsService = new ParticipantsService()
