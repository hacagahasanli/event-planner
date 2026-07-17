import { az } from "date-fns/locale"
import { format } from "date-fns"
import { Banknote, CalendarDays, MapPin, Users } from "lucide-react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { EventRecord } from "@/entities/event/model/types"

const splitLabels: Record<EventRecord["splitType"], string> = {
  none: "Bölüşmürük",
  equal: "Bərabər böl",
  custom: "Fərdi məbləğ",
}

export function EventCard({ event }: { event: EventRecord }) {
  const date = new Date(event.eventDate)
  const isPast = date.getTime() < Date.now()

  return (
    <Link to={`/events/${event.id}`}>
      <Card className="hover:border-primary/40 h-full transition-colors hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base">{event.title}</CardTitle>
            {isPast && (
              <Badge variant="outline" className="shrink-0 text-xs">
                keçdi
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <div className="text-muted-foreground flex items-center gap-2">
            <CalendarDays className="size-4 shrink-0" />
            <span className="truncate">{format(date, "d MMMM yyyy, HH:mm", { locale: az })}</span>
          </div>

          {event.locationName && (
            <div className="text-muted-foreground flex items-center gap-2">
              <MapPin className="size-4 shrink-0" />
              <span className="truncate">{event.locationName}</span>
            </div>
          )}

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Users className="size-3" />
              {event.participantCount + 1}
            </Badge>
            {event.splitType !== "none" && event.totalCost != null && (
              <Badge variant="secondary" className="gap-1">
                <Banknote className="size-3" />
                {event.totalCost.toFixed(2)} ₼ · {splitLabels[event.splitType]}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
