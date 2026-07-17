import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TodoList } from "@/features/manage-todos/ui/todo-list"

export function TodosPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5 px-4 py-6">
      <h1 className="text-xl font-semibold">Planlar</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gələcəkdə nə edəcəyik</CardTitle>
        </CardHeader>
        <CardContent>
          <TodoList />
        </CardContent>
      </Card>
    </div>
  )
}
