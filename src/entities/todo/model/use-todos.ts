import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { todosService } from "./todos-service"

const todosKey = ["shared-todos"] as const

export function useTodos() {
  return useQuery({
    queryKey: todosKey,
    queryFn: () => todosService.list(),
  })
}

export function useAddTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ text, createdBy }: { text: string; createdBy: string }) =>
      todosService.add(text, createdBy),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: todosKey }),
  })
}

export function useToggleTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isDone }: { id: string; isDone: boolean }) => todosService.setDone(id, isDone),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: todosKey }),
  })
}

export function useRemoveTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => todosService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: todosKey }),
  })
}
