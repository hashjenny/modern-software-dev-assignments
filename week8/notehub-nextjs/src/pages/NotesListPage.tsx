import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase, type Note } from "@/lib/supabase"
import { NoteCard } from "@/components/NoteCard"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"
import { PenLine, FileText } from "lucide-react"

const PAGE_SIZE = 12

export function NotesListPage() {
  const navigate = useNavigate()
  const [notes, setNotes] = useState<Note[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const from = page * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    supabase
      .from("notes")
      .select("*, category:categories(*)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to)
      .then(({ data, count }) => {
        if (data) setNotes(data)
        if (count !== null) setTotal(count)
        setLoading(false)
      })
  }, [page])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight">Notes</h1>
          {!loading && (
            <p className="text-sm text-muted-foreground mt-1">
              {total} {total === 1 ? "note" : "notes"} total
            </p>
          )}
        </div>
        <Button onClick={() => navigate("/notes/new")}>
          <PenLine className="size-4" />
          New Note
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>
            <EmptyTitle>No notes yet</EmptyTitle>
            <EmptyDescription>
              Create your first note to get started.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => navigate("/notes/new")}>
              <PenLine className="size-4" />
              Create note
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
