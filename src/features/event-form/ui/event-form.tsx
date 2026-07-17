import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { EventInput, SplitType } from "@/entities/event/model/types"
import { LocationPicker, type LocationValue } from "@/features/pick-location/ui/location-picker"

const formSchema = z.object({
  title: z.string().trim().min(1, "Başlıq lazımdır").max(120),
  description: z.string().trim().max(2000).optional(),
  eventDate: z.string().min(1, "Tarix və saat seç"),
  totalCost: z.string().trim(),
  splitType: z.enum(["none", "equal", "custom"]),
})

type FormValues = z.infer<typeof formSchema>

function toDatetimeLocal(iso?: string): string {
  if (!iso) return ""
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export interface EventFormInitialValues {
  title?: string
  description?: string | null
  eventDate?: string
  totalCost?: number | null
  splitType?: SplitType
  location?: LocationValue | null
}

export function EventForm({
  initialValues,
  submitLabel = "Yadda saxla",
  isSubmitting = false,
  onSubmit,
}: {
  initialValues?: EventFormInitialValues
  submitLabel?: string
  isSubmitting?: boolean
  onSubmit: (input: EventInput) => void | Promise<void>
}) {
  const [location, setLocation] = useState<LocationValue | null>(initialValues?.location ?? null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialValues?.title ?? "",
      description: initialValues?.description ?? "",
      eventDate: toDatetimeLocal(initialValues?.eventDate),
      totalCost: initialValues?.totalCost != null ? String(initialValues.totalCost) : "",
      splitType: initialValues?.splitType ?? "none",
    },
  })

  function submit(values: FormValues) {
    const parsedCost = values.totalCost.trim() === "" ? null : Number(values.totalCost)

    const input: EventInput = {
      title: values.title,
      description: values.description?.trim() || null,
      eventDate: new Date(values.eventDate).toISOString(),
      totalCost: parsedCost !== null && !Number.isNaN(parsedCost) ? parsedCost : null,
      splitType: values.splitType,
      locationName: location?.name ?? null,
      locationLat: location?.lat ?? null,
      locationLng: location?.lng ?? null,
    }
    return onSubmit(input)
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Başlıq</Label>
        <Input id="title" placeholder="məs: Dənizkənarı şam yeməyi" {...register("title")} />
        {errors.title && <p className="text-destructive text-xs">{errors.title.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Qeyd (optional)</Label>
        <Textarea id="description" placeholder="Ətraflı..." {...register("description")} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="eventDate">Tarix və saat</Label>
        <Input id="eventDate" type="datetime-local" {...register("eventDate")} />
        {errors.eventDate && <p className="text-destructive text-xs">{errors.eventDate.message}</p>}
      </div>

      <LocationPicker value={location} onChange={setLocation} />

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="totalCost">Ümumi xərc (₼, optional)</Label>
          <Input id="totalCost" type="number" step="0.01" min="0" placeholder="0.00" {...register("totalCost")} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Bölüşmə</Label>
          <Controller
            control={control}
            name="splitType"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Bölüşmürük</SelectItem>
                  <SelectItem value="equal">Bərabər böl</SelectItem>
                  <SelectItem value="custom">Fərdi məbləğ</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="mt-2">
        {isSubmitting ? "Yadda saxlanılır…" : submitLabel}
      </Button>
    </form>
  )
}
