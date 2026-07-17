import { CalendarX2 } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { useEventsList } from "@/entities/event/model/use-events"
import { EventCard } from "@/widgets/event-card/ui/event-card"

export function EventList() {
  const { data: events, isLoading, isError } = useEventsList()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    )
  }

  if (isError) {
    return <p className="text-destructive text-sm">Eventlər yüklənmədi. Yenidən cəhd et.</p>
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center text-sm">
        <CalendarX2 className="size-8" />
        Hələ event yoxdur. Yuxarıdan yenisini yarat.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}
