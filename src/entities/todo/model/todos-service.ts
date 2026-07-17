import { BaseService } from "@/shared/api/base-service"

import type { TodoItem } from "./types"

interface TodoRow {
  id: string
  text: string
  is_done: boolean
  created_by: string
  created_at: string
  done_at: string | null
}

const COLUMNS = "id, text, is_done, created_by, created_at, done_at"

function toTodoItem(row: TodoRow): TodoItem {
  return {
    id: row.id,
    text: row.text,
    isDone: row.is_done,
    createdBy: row.created_by,
    createdAt: row.created_at,
    doneAt: row.done_at,
  }
}

/**
 * The shared "what we'll do next" checklist — a single list (not per-event),
 * locked down to two usernames at the database level (see
 * supabase/migrations/0002_shared_todos.sql).
 */
export class TodosService extends BaseService {
  async list(): Promise<TodoItem[]> {
    const { data, error } = await this.client
      .from("shared_todos")
      .select(COLUMNS)
      .order("is_done", { ascending: true })
      .order("created_at", { ascending: true })

    this.throwIfError(error)
    return (data ?? []).map(toTodoItem)
  }

  async add(text: string, createdBy: string): Promise<TodoItem> {
    const { data, error } = await this.client
      .from("shared_todos")
      .insert({ text: text.trim(), created_by: createdBy })
      .select(COLUMNS)
      .single()

    this.throwIfError(error)
    return toTodoItem(data!)
  }

  async setDone(id: string, isDone: boolean): Promise<void> {
    const { error } = await this.client
      .from("shared_todos")
      .update({ is_done: isDone, done_at: isDone ? new Date().toISOString() : null })
      .eq("id", id)

    this.throwIfError(error)
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.client.from("shared_todos").delete().eq("id", id)
    this.throwIfError(error)
  }
}

export const todosService = new TodosService()
