import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { supabase, type Note } from "@/lib/supabase"
import { NoteForm } from "@/components/NoteForm"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { ArrowLeft } from "lucide-react"

export function NoteEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    supabase
      .from("notes")
      .select("*, category:categories(*)")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        setNote(data)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="flex flex-col gap-4 max-w-2xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <p className="text-muted-foreground">Note not found.</p>
        <Button variant="outline" onClick={() => navigate("/notes")}>
          <ArrowLeft className="size-4" />
          Back to notes
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/notes">Notes</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/notes/${note.id}`} className="max-w-[160px] truncate block">
                {note.title}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <CardTitle>Edit note</CardTitle>
          <CardDescription>Update the details of your note.</CardDescription>
        </CardHeader>
        <CardContent>
          <NoteForm note={note} onSave={(saved) => navigate(`/notes/${saved.id}`)} />
        </CardContent>
      </Card>
    </div>
  )
}
