import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase, type Category } from "@/lib/supabase"
import { CategoryCard } from "@/components/CategoryCard"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"
import { FolderOpen, Plus } from "lucide-react"

type CategoryWithCount = Category & { noteCount: number }

export function CategoriesPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<CategoryWithCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from("categories").select("*").order("name"),
      supabase.from("notes").select("category_id"),
    ]).then(([{ data: cats }, { data: notes }]) => {
      if (!cats) { setLoading(false); return }
      const counts: Record<string, number> = {}
      for (const n of notes ?? []) {
        if (n.category_id) counts[n.category_id] = (counts[n.category_id] ?? 0) + 1
      }
      setCategories(cats.map((c) => ({ ...c, noteCount: counts[c.id] ?? 0 })))
      setLoading(false)
    })
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight">Categories</h1>
          {!loading && (
            <p className="text-sm text-muted-foreground mt-1">
              {categories.length} {categories.length === 1 ? "category" : "categories"}
            </p>
          )}
        </div>
        <Button onClick={() => navigate("/categories/new")}>
          <Plus className="size-4" />
          New Category
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderOpen />
            </EmptyMedia>
            <EmptyTitle>No categories yet</EmptyTitle>
            <EmptyDescription>
              Organize your notes by creating categories.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => navigate("/categories/new")}>
              <Plus className="size-4" />
              Create category
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      )}
    </div>
  )
}
