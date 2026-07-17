import { az } from "date-fns/locale"
import { format } from "date-fns"
import { ArrowLeft, Banknote, CalendarDays, MapPin, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { computeEqualSplit, customSplitLines } from "@/entities/event/lib/split"
import { useDeleteEvent, useEvent, useUpdateEvent } from "@/entities/event/model/use-events"
import { useParticipants } from "@/entities/participant/model/use-participants"
import { useSession } from "@/entities/session/model/use-session"
import { EventForm } from "@/features/event-form/ui/event-form"
import { ParticipantWhitelistEditor } from "@/features/manage-participants/ui/participant-whitelist-editor"

const splitLabels = {
  none: "Bölüşmürük",
  equal: "Bərabər böl",
  custom: "Fərdi məbləğ",
} as const

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { username } = useSession()
  const { data: event, isLoading } = useEvent(id)
  const { data: participants = [] } = useParticipants(id)
  const updateEvent = useUpdateEvent()
  const deleteEvent = useDeleteEvent()
  const [isEditing, setIsEditing] = useState(false)

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-4 py-16 text-center">
        <p className="text-muted-foreground text-sm">
          Bu event tapılmadı — ya silinib, ya da sən whitelist-də deyilsən.
        </p>
        <Button variant="outline" asChild>
          <Link to="/">Eventlərə qayıt</Link>
        </Button>
      </div>
    )
  }

  const isCreator = event.createdBy === username

  const splitLines =
    event.splitType === "equal" && event.totalCost
      ? computeEqualSplit(event.totalCost, participants)
      : event.splitType === "custom"
        ? customSplitLines(participants)
        : []

  async function handleUpdate(input: Parameters<typeof updateEvent.mutateAsync>[0]["input"]) {
    if (!event) return
    try {
      await updateEvent.mutateAsync({ id: event.id, input })
      setIsEditing(false)
      toast.success("Yeniləndi")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Yenilənmədi")
    }
  }

  async function handleDelete() {
    if (!event) return
    try {
      await deleteEvent.mutateAsync(event.id)
      toast.success("Event silindi")
      navigate("/")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Silinmədi")
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" className="gap-1.5" asChild>
          <Link to="/">
            <ArrowLeft className="size-4" />
            Geri
          </Link>
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setIsEditing((v) => !v)}>
            <Pencil className="size-4" />
            {isEditing ? "Ləğv et" : "Redaktə et"}
          </Button>

          {isCreator && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive gap-1.5">
                  <Trash2 className="size-4" />
                  Sil
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Bu event silinsin?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bu addım geri qaytarılmır. Whitelist də silinəcək.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Sil</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>Eventi redaktə et</CardTitle>
          </CardHeader>
          <CardContent>
            <EventForm
              initialValues={{
                title: event.title,
                description: event.description,
                eventDate: event.eventDate,
                totalCost: event.totalCost,
                splitType: event.splitType,
                location:
                  event.locationLat != null && event.locationLng != null
                    ? { name: event.locationName ?? "", lat: event.locationLat, lng: event.locationLng }
                    : null,
              }}
              isSubmitting={updateEvent.isPending}
              onSubmit={handleUpdate}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{event.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {event.description && <p className="text-sm whitespace-pre-wrap">{event.description}</p>}

            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <CalendarDays className="size-4 shrink-0" />
              {format(new Date(event.eventDate), "d MMMM yyyy, HH:mm", { locale: az })}
            </div>

            {event.locationName && (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <MapPin className="size-4 shrink-0" />
                <a
                  href={`https://www.openstreetmap.org/?mlat=${event.locationLat}&mlon=${event.locationLng}#map=16/${event.locationLat}/${event.locationLng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  {event.locationName}
                </a>
              </div>
            )}

            {event.splitType !== "none" && event.totalCost != null && (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Banknote className="size-4 shrink-0" />
                Ümumi: {event.totalCost.toFixed(2)} ₼ · {splitLabels[event.splitType]}
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              <Badge variant="secondary">Yaradan: {event.createdBy}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {event.splitType !== "none" && event.totalCost != null && splitLines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Kim nə qədər verir</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 text-sm">
              <li className="flex items-center justify-between">
                <span>{event.createdBy} (yaradan)</span>
              </li>
              {splitLines.map((line) => (
                <li key={line.username} className="flex items-center justify-between">
                  <span>{line.username}</span>
                  <span className="font-medium">{line.amount.toFixed(2)} ₼</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">İştirakçılar</CardTitle>
        </CardHeader>
        <CardContent>
          <ParticipantWhitelistEditor
            eventId={event.id}
            participants={participants}
            splitType={event.splitType}
            totalCost={event.totalCost}
            createdBy={event.createdBy}
          />
        </CardContent>
      </Card>
    </div>
  )
}
