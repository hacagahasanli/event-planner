import { CalendarHeart } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoginForm } from "@/features/login-with-username/ui/login-form"

export function LoginPage() {
  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CalendarHeart className="size-6" />
          </div>
          <CardTitle className="text-xl">Event Planner</CardTitle>
          <CardDescription>
            Username-nlə daxil ol. Yalnız əlavə edildiyin eventləri görəcəksən.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}
