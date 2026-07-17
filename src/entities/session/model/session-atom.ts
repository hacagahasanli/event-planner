import { atomWithStorage } from "jotai/utils"

import { SESSION_STORAGE_KEY } from "@/shared/config/env"

/** The logged-in username, persisted in localStorage so refreshing the page keeps you logged in. */
export const usernameAtom = atomWithStorage<string | null>(SESSION_STORAGE_KEY, null)
