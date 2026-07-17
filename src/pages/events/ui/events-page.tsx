import { Plus } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useCreateEvent } from "@/entities/event/model/use-events"
import { useSession } from "@/entities/session/model/use-session"
import { EventForm } from "@/features/event-form/ui/event-form"
import { EventList } from "@/widgets/event-list/ui/event-list"

export function EventsPage() {
  const { username } = useSession()
  const navigate = useNavigate()
  const createEvent = useCreateEvent()
  const [isOpen, setIsOpen] = useState(false)

  async function handleCreate(input: Parameters<typeof createEvent.mutateAsync>[0]["input"]) {
    if (!username) return
    try {
      const event = await createEvent.mutateAsync({ input, createdBy: username })
      setIsOpen(false)
      toast.success("Event yaradıldı")
      navigate(`/events/${event.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Yaradılmadı")
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Eventlər</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <Button onClick={() => setIsOpen(true)} className="gap-1.5">
            <Plus className="size-4" />
            Yeni event
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni event yarat</DialogTitle>
            </DialogHeader>
            <EventForm onSubmit={handleCreate} isSubmitting={createEvent.isPending} submitLabel="Yarat" />
          </DialogContent>
        </Dialog>
      </div>

      <EventList />
    </div>
  )
}
