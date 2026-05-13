import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { supabase, type Note } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { Pencil, Trash2, ArrowLeft, Clock, FolderOpen } from "lucide-react"
import { formatDateFull } from "@/lib/format"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

export function NoteDetailPage() {
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

  async function handleDelete() {
    if (!id) return
    const { error } = await supabase.from("notes").delete().eq("id", id)
    if (error) { toast.error("Failed to delete note"); return }
    toast.success("Note deleted")
    navigate("/notes")
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4 max-w-3xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-48 w-full" />
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

  const paragraphs = note.content?.split(/\n\n+/).filter(Boolean) ?? []

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/notes">Notes</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-[200px] truncate">{note.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-3">
        <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight text-balance">
          {note.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {formatDateFull(note.created_at)}
          </span>
          {note.category && (
            <>
              <span className="text-border">·</span>
              <Link to={`/categories/${note.category.id}`} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                <FolderOpen className="size-3.5" />
                <Badge variant="secondary" className="text-xs">{note.category.name}</Badge>
              </Link>
            </>
          )}
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-4">
        {note.content ? (
          paragraphs.map((para, i) => (
            <p key={i} className="leading-7 text-foreground whitespace-pre-wrap">
              {para}
            </p>
          ))
        ) : (
          <p className="text-muted-foreground italic">No content.</p>
        )}
      </div>

      <Separator />

      <div className="flex gap-3">
        <Button asChild>
          <Link to={`/notes/${note.id}/edit`}>
            <Pencil className="size-4" />
            Edit
          </Link>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="size-4" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete note?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The note "{note.title}" will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
