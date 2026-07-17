import { useAtom } from "jotai"
import { useCallback, useEffect } from "react"

import { setActiveUsername } from "@/shared/api/supabase-client"

import { authService } from "./auth-service"
import { usernameAtom } from "./session-atom"

export function useSession() {
  const [username, setUsername] = useAtom(usernameAtom)

  // Keep the supabase client's request header in sync with the atom,
  // including on first mount (e.g. after a page refresh).
  useEffect(() => {
    setActiveUsername(username)
  }, [username])

  const login = useCallback(
    async (rawUsername: string, displayName?: string) => {
      const user = await authService.ensureUsername(rawUsername, displayName)
      setActiveUsername(user.username)
      setUsername(user.username)
      return user
    },
    [setUsername]
  )

  const logout = useCallback(() => {
    setActiveUsername(null)
    setUsername(null)
  }, [setUsername])

  return { username, isLoggedIn: Boolean(username), login, logout }
}
