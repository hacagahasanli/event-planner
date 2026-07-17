import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { authService } from "@/entities/session/model/auth-service"

import { participantsService } from "./participants-service"

const participantsKeys = {
  byEvent: (eventId: string) => ["event-participants", eventId] as const,
}

export function useParticipants(eventId: string | undefined) {
  return useQuery({
    queryKey: participantsKeys.byEvent(eventId ?? ""),
    queryFn: () => participantsService.listByEvent(eventId as string),
    enabled: Boolean(eventId),
  })
}

export function useAddParticipant(eventId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ username, isPayer }: { username: string; isPayer?: boolean }) => {
      // Registers the username in app_users if it's brand new (custom name),
      // then whitelists it for this event.
      const user = await authService.ensureUsername(username)
      return participantsService.add(eventId, user.username, isPayer ?? true)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: participantsKeys.byEvent(eventId) })
    },
  })
}

export function useSetParticipantShare(eventId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ participantId, shareAmount }: { participantId: string; shareAmount: number | null }) =>
      participantsService.setShare(participantId, shareAmount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: participantsKeys.byEvent(eventId) })
    },
  })
}

export function useSetParticipantIsPayer(eventId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ participantId, isPayer }: { participantId: string; isPayer: boolean }) =>
      participantsService.setIsPayer(participantId, isPayer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: participantsKeys.byEvent(eventId) })
    },
  })
}

export function useRemoveParticipant(eventId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (participantId: string) => participantsService.remove(participantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: participantsKeys.byEvent(eventId) })
    },
  })
}
