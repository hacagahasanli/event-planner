import { useQuery } from "@tanstack/react-query"

import { authService } from "./auth-service"

/** All usernames ever registered — used to power the "pick from existing" autocomplete. */
export function useUsersList() {
  return useQuery({
    queryKey: ["app-users"],
    queryFn: () => authService.listUsers(),
    staleTime: 30_000,
  })
}
