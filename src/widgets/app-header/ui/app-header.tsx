import { CalendarHeart, LogOut } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { useSession } from "@/entities/session/model/use-session"

export function AppHeader() {
  const { username, logout } = useSession()

  return (
    <header className="border-border/70 bg-background/80 sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-xl">
            <CalendarHeart className="size-4" />
          </span>
          Event Planner
        </Link>

        {username && (
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-sm">{username}</span>
            <Button variant="ghost" size="icon" className="size-8" onClick={logout} aria-label="Çıxış">
              <LogOut className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
