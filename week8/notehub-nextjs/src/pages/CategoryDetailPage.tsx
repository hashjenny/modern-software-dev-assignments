import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { supabase, type Category, type Note } from "@/lib/supabase"
import { NoteCard } from "@/components/NoteCard"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
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
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { toast } from "sonner"
import { Trash2, PenLine, FileText, ArrowLeft } from "lucide-react"

export function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [category, setCategory] = useState<Category | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      supabase.from("categories").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("notes")
        .select("*, category:categories(*)")
        .eq("category_id", id)
        .order("created_at", { ascending: false }),
    ]).then(([{ data: cat }, { data: notesData }]) => {
      setCategory(cat)
      setNotes(notesData ?? [])
      setLoading(false)
    })
  }, [id])

  async function handleDelete() {
    if (!id) return
    const { error } = await supabase.from("categories").delete().eq("id", id)
    if (error) { toast.error("Failed to delete category"); return }
    toast.success("Category deleted")
    navigate("/categories")
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4 max-w-4xl">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <p className="text-muted-foreground">Category not found.</p>
        <Button variant="outline" onClick={() => navigate("/categories")}>
          <ArrowLeft className="size-4" />
          Back to categories
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/categories">Categories</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{category.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight">{category.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {notes.length} {notes.length === 1 ? "note" : "notes"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/notes/new">
              <PenLine className="size-4" />
              Add note
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete category?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will delete the category "{category.name}". Notes in this category won't be deleted, but they'll be uncategorized.
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

      {notes.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>
            <EmptyTitle>No notes in this category</EmptyTitle>
            <EmptyDescription>
              Create a note and assign it to this category.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link to="/notes/new">
                <PenLine className="size-4" />
                Create note
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  )
}
