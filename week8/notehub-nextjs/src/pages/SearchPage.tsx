import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { supabase, type Note } from "@/lib/supabase"
import { NoteCard } from "@/components/NoteCard"
import { SearchBar } from "@/components/SearchBar"
import { Skeleton } from "@/components/ui/skeleton"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { Search } from "lucide-react"

export function SearchPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.get("q") ?? ""
  const [results, setResults] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (!query.trim()) { setResults([]); setSearched(false); return }
    setLoading(true)
    setSearched(true)

    supabase
      .from("notes")
      .select("*, category:categories(*)")
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setResults(data ?? [])
        setLoading(false)
      })
  }, [query])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight">Search</h1>
        {query && !loading && searched && (
          <p className="text-sm text-muted-foreground mt-1">
            {results.length} {results.length === 1 ? "result" : "results"} for "{query}"
          </p>
        )}
      </div>

      <div className="max-w-lg">
        <SearchBar
          defaultValue={query}
          onSearch={(q) => navigate(`/search?q=${encodeURIComponent(q)}`)}
          placeholder="Search by title or content..."
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : !searched ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search />
            </EmptyMedia>
            <EmptyTitle>Search your notes</EmptyTitle>
            <EmptyDescription>
              Type a keyword and press Enter to search by title or content.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : results.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search />
            </EmptyMedia>
            <EmptyTitle>No results found</EmptyTitle>
            <EmptyDescription>
              No notes match "{query}". Try a different search term.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  )
}
