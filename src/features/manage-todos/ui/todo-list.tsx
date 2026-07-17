import { Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useAddTodo, useRemoveTodo, useToggleTodo, useTodos } from "@/entities/todo/model/use-todos"
import { useSession } from "@/entities/session/model/use-session"

export function TodoList() {
  const { username } = useSession()
  const { data: todos, isLoading } = useTodos()
  const addTodo = useAddTodo()
  const toggleTodo = useToggleTodo()
  const removeTodo = useRemoveTodo()
  const [text, setText] = useState("")

  async function handleAdd() {
    const value = text.trim()
    if (!value || !username) return
    try {
      await addTodo.mutateAsync({ text: value, createdBy: username })
      setText("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Əlavə edilmədi")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Input
          placeholder="Nə etmək istəyirik? (məs: bilet almaq)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleAdd()
            }
          }}
        />
        <Button type="button" onClick={handleAdd} disabled={addTodo.isPending || !text.trim()}>
          <Plus className="size-4" />
        </Button>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-11 rounded-lg" />
          <Skeleton className="h-11 rounded-lg" />
        </div>
      )}

      {!isLoading && (!todos || todos.length === 0) && (
        <p className="text-muted-foreground py-8 text-center text-sm">
          Hələ heç nə yoxdur — yuxarıdan əlavə et.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {todos?.map((todo) => (
          <li
            key={todo.id}
            className="group bg-muted/40 flex items-center gap-3 rounded-lg border px-3 py-2.5"
          >
            <Checkbox
              checked={todo.isDone}
              onCheckedChange={(checked) =>
                toggleTodo.mutate({ id: todo.id, isDone: Boolean(checked) })
              }
            />
            <span
              className={
                todo.isDone
                  ? "text-muted-foreground flex-1 text-sm line-through"
                  : "flex-1 text-sm"
              }
            >
              {todo.text}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground size-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => removeTodo.mutate(todo.id)}
              aria-label="Sil"
            >
              <Trash2 className="size-4" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
