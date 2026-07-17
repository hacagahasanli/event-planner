import { BaseService } from "@/shared/api/base-service"

import type { EventInput, EventRecord, SplitType } from "./types"

interface EventRow {
  id: string
  title: string
  description: string | null
  event_date: string
  location_name: string | null
  location_lat: number | null
  location_lng: number | null
  total_cost: number | null
  split_type: SplitType
  created_by: string
  created_at: string
  updated_at: string
  event_participants?: { count: number }[]
}

const EVENT_COLUMNS =
  "id, title, description, event_date, location_name, location_lat, location_lng, total_cost, split_type, created_by, created_at, updated_at, event_participants(count)"

function toEventRecord(row: EventRow): EventRecord {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    eventDate: row.event_date,
    locationName: row.location_name,
    locationLat: row.location_lat,
    locationLng: row.location_lng,
    totalCost: row.total_cost === null ? null : Number(row.total_cost),
    splitType: row.split_type,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    participantCount: row.event_participants?.[0]?.count ?? 0,
  }
}

function toRowInput(input: EventInput) {
  return {
    title: input.title,
    description: input.description ?? null,
    event_date: input.eventDate,
    location_name: input.locationName ?? null,
    location_lat: input.locationLat ?? null,
    location_lng: input.locationLng ?? null,
    total_cost: input.totalCost ?? null,
    split_type: input.splitType,
  }
}

/** All reads/writes against the "events" table. RLS enforces per-username visibility. */
export class EventsService extends BaseService {
  async list(): Promise<EventRecord[]> {
    const { data, error } = await this.client
      .from("events")
      .select(EVENT_COLUMNS)
      .order("event_date", { ascending: true })

    this.throwIfError(error)
    return (data ?? []).map((row) => toEventRecord(row as unknown as EventRow))
  }

  async getById(id: string): Promise<EventRecord | null> {
    const { data, error } = await this.client
      .from("events")
      .select(EVENT_COLUMNS)
      .eq("id", id)
      .maybeSingle()

    this.throwIfError(error)
    return data ? toEventRecord(data as unknown as EventRow) : null
  }

  async create(input: EventInput, createdBy: string): Promise<EventRecord> {
    const { data, error } = await this.client
      .from("events")
      .insert({ ...toRowInput(input), created_by: createdBy })
      .select(EVENT_COLUMNS)
      .single()

    this.throwIfError(error)
    return toEventRecord(data as unknown as EventRow)
  }

  async update(id: string, input: EventInput): Promise<EventRecord> {
    const { data, error } = await this.client
      .from("events")
      .update(toRowInput(input))
      .eq("id", id)
      .select(EVENT_COLUMNS)
      .single()

    this.throwIfError(error)
    return toEventRecord(data as unknown as EventRow)
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.client.from("events").delete().eq("id", id)
    this.throwIfError(error)
  }
}

export const eventsService = new EventsService()
