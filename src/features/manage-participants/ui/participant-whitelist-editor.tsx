import { Loader2, UserPlus, X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { computeEqualSplit, customSplitLines } from "@/entities/event/lib/split"
import type { SplitType } from "@/entities/event/model/types"
import type { Participant } from "@/entities/participant/model/types"
import {
  useAddParticipant,
  useRemoveParticipant,
  useSetParticipantIsPayer,
  useSetParticipantShare,
} from "@/entities/participant/model/use-participants"
import { useUsersList } from "@/entities/session/model/use-users-list"

export function ParticipantWhitelistEditor({
  eventId,
  participants,
  splitType,
  totalCost,
  createdBy,
}: {
  eventId: string
  participants: Participant[]
  splitType: SplitType
  totalCost: number | null
  createdBy: string
}) {
  const [newUsername, setNewUsername] = useState("")

  const { data: allUsers } = useUsersList()
  const addParticipant = useAddParticipant(eventId)
  const removeParticipant = useRemoveParticipant(eventId)
  const setIsPayer = useSetParticipantIsPayer(eventId)
  const setShare = useSetParticipantShare(eventId)

  const knownUsernames = (allUsers ?? []).map((u) => u.username)
  const alreadyAdded = new Set(participants.map((p) => p.username))
  const availableToAdd = knownUsernames.filter((u) => !alreadyAdded.has(u) && u !== createdBy)

  const equalShares =
    splitType === "equal" && totalCost
      ? new Map(computeEqualSplit(totalCost, participants).map((l) => [l.username, l.amount]))
      : null
  const customShares =
    splitType === "custom" ? new Map(customSplitLines(participants).map((l) => [l.username, l.amount])) : null

  async function handleAdd() {
    const username = newUsername.trim()
    if (!username) return
    try {
      await addParticipant.mutateAsync({ username })
      setNewUsername("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Əlavə edilmədi")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label className="mb-2">Whitelist — kim bu eventi görə bilər</Label>
        <p className="text-muted-foreground mb-3 text-xs">
          Yaradan ({createdBy}) həmişə görür. Aşağıdakılar da username-ləri ilə daxil olanda bu eventi görəcək.
        </p>

        {participants.length === 0 && (
          <p className="text-muted-foreground text-sm">Hələ heç kim əlavə edilməyib.</p>
        )}

        <ul className="flex flex-col gap-2">
          {participants.map((p) => (
            <li
              key={p.id}
              className="bg-muted/50 flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2"
            >
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{p.username}</span>

              {splitType !== "none" && (
                <label className="flex items-center gap-1.5 text-xs">
                  <Checkbox
                    checked={p.isPayer}
                    onCheckedChange={(checked) =>
                      setIsPayer.mutate({ participantId: p.id, isPayer: Boolean(checked) })
                    }
                  />
                  bölüşür
                </label>
              )}

              {splitType === "equal" && p.isPayer && (
                <span className="text-primary w-20 text-right text-sm font-medium">
                  {equalShares?.get(p.username)?.toFixed(2) ?? "0.00"} ₼
                </span>
              )}

              {splitType === "custom" && p.isPayer && (
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  className="h-8 w-24"
                  placeholder="0.00"
                  defaultValue={customShares?.get(p.username) || ""}
                  onBlur={(e) => {
                    const value = e.target.value.trim()
                    setShare.mutate({
                      participantId: p.id,
                      shareAmount: value === "" ? null : Number(value),
                    })
                  }}
                />
              )}

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 shrink-0"
                onClick={() => removeParticipant.mutate(p.id)}
                aria-label={`${p.username} sil`}
              >
                <X className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="add-participant">Adam əlavə et</Label>
        <div className="flex gap-2">
          <Input
            id="add-participant"
            list="known-usernames"
            placeholder="mövcud username seç ya da yenisini yaz"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAdd()
              }
            }}
          />
          <datalist id="known-usernames">
            {availableToAdd.map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>
          <Button type="button" onClick={handleAdd} disabled={addParticipant.isPending || !newUsername.trim()}>
            {addParticipant.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UserPlus className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
