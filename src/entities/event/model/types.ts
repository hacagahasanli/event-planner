export type SplitType = "none" | "equal" | "custom"

export interface EventRecord {
  id: string
  title: string
  description: string | null
  eventDate: string // ISO timestamp
  locationName: string | null
  locationLat: number | null
  locationLng: number | null
  totalCost: number | null
  splitType: SplitType
  createdBy: string
  createdAt: string
  updatedAt: string
  participantCount: number
}

export interface EventInput {
  title: string
  description?: string | null
  eventDate: string
  locationName?: string | null
  locationLat?: number | null
  locationLng?: number | null
  totalCost?: number | null
  splitType: SplitType
}
