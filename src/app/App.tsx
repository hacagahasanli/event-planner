import { Route, Routes } from "react-router-dom"

import { useSession } from "@/entities/session/model/use-session"
import { EventDetailPage } from "@/pages/event-detail/ui/event-detail-page"
import { EventsPage } from "@/pages/events/ui/events-page"
import { LoginPage } from "@/pages/login/ui/login-page"
import { TodosPage } from "@/pages/todos/ui/todos-page"
import { AppHeader } from "@/widgets/app-header/ui/app-header"

export function App() {
  const { isLoggedIn } = useSession()

  if (!isLoggedIn) {
    return <LoginPage />
  }

  return (
    <div className="min-h-svh">
      <AppHeader />
      <main>
        <Routes>
          <Route path="/" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/todos" element={<TodosPage />} />
        </Routes>
      </main>
    </div>
  )
}
