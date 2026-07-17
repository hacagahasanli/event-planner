import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSession } from "@/entities/session/model/use-session"

export function LoginForm() {
  const { login } = useSession()
  const [username, setUsername] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim()) return

    setIsSubmitting(true)
    try {
      await login(username)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Giriş alınmadı")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          autoFocus
          placeholder="mesela: hajagha"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="off"
        />
      </div>
      <Button type="submit" disabled={isSubmitting || !username.trim()} className="w-full">
        {isSubmitting ? "Girilir…" : "Daxil ol"}
      </Button>
    </form>
  )
}
