import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FolderOpen } from "lucide-react"
import type { Category } from "@/lib/supabase"
import { formatDate } from "@/lib/format"

interface CategoryCardProps {
  category: Category & { noteCount: number }
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link to={`/categories/${category.id}`} className="group block">
      <Card className="h-full transition-all hover:shadow-md hover:border-primary/30">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <FolderOpen className="size-4 text-muted-foreground shrink-0" />
            <CardTitle className="text-sm font-medium leading-snug group-hover:text-primary transition-colors">
              {category.name}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0 flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {category.noteCount} {category.noteCount === 1 ? "note" : "notes"}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatDate(category.created_at)}
          </span>
        </CardContent>
      </Card>
    </Link>
  )
}
