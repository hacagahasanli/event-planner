import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { eventsService } from "./events-service"
import type { EventInput } from "./types"

const eventsKeys = {
  all: ["events"] as const,
  detail: (id: string) => ["events", id] as const,
}

export function useEventsList() {
  return useQuery({
    queryKey: eventsKeys.all,
    queryFn: () => eventsService.list(),
  })
}

export function useEvent(id: string | undefined) {
  return useQuery({
    queryKey: eventsKeys.detail(id ?? ""),
    queryFn: () => eventsService.getById(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ input, createdBy }: { input: EventInput; createdBy: string }) =>
      eventsService.create(input, createdBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsKeys.all })
    },
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: EventInput }) =>
      eventsService.update(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: eventsKeys.all })
      queryClient.invalidateQueries({ queryKey: eventsKeys.detail(variables.id) })
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => eventsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsKeys.all })
    },
  })
}
