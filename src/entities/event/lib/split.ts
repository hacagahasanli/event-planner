import type { Participant } from "@/entities/participant/model/types"

export interface SplitLine {
  username: string
  amount: number
}

/** Even split of `totalCost` across everyone marked as a payer, rounded to cents. */
export function computeEqualSplit(totalCost: number, participants: Participant[]): SplitLine[] {
  const payers = participants.filter((p) => p.isPayer)
  if (payers.length === 0 || totalCost <= 0) return []

  const base = Math.floor((totalCost / payers.length) * 100) / 100
  const remainder = Math.round((totalCost - base * payers.length) * 100)

  return payers.map((p, index) => ({
    username: p.username,
    // distribute any leftover cents to the first few payers so the total matches exactly
    amount: index < remainder ? base + 0.01 : base,
  }))
}

/** Custom split just uses whatever share_amount was saved per participant. */
export function customSplitLines(participants: Participant[]): SplitLine[] {
  return participants
    .filter((p) => p.isPayer)
    .map((p) => ({ username: p.username, amount: p.shareAmount ?? 0 }))
}

export function sumShares(lines: SplitLine[]): number {
  return Math.round(lines.reduce((sum, l) => sum + l.amount, 0) * 100) / 100
}
