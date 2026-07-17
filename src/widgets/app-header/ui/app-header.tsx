import { CalendarHeart, ListChecks, LogOut } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useSession } from "@/entities/session/model/use-session"

export function AppHeader() {
  const { username, logout } = useSession()
  const location = useLocation()

  return (
    <header className="border-border/70 bg-background/80 sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <div className="flex items-center gap-5">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-xl">
              <CalendarHeart className="size-4" />
            </span>
            Event Planner
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            <Link
              to="/"
              className={cn(
                "text-muted-foreground hover:text-foreground transition-colors",
                location.pathname === "/" && "text-foreground font-medium"
              )}
            >
              Eventlər
            </Link>
            <Link
              to="/todos"
              className={cn(
                "text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors",
                location.pathname === "/todos" && "text-foreground font-medium"
              )}
            >
              <ListChecks className="size-3.5" />
              Planlar
            </Link>
          </nav>
        </div>

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
