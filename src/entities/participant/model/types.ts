export interface Participant {
  id: string
  eventId: string
  username: string
  isPayer: boolean
  shareAmount: number | null
  addedAt: string
}
