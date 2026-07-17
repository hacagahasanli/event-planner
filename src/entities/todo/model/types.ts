export interface TodoItem {
  id: string
  text: string
  isDone: boolean
  createdBy: string
  createdAt: string
  doneAt: string | null
}
