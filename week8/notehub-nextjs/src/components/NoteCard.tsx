import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText } from "lucide-react"
import type { Note } from "@/lib/supabase"
import { formatDate } from "@/lib/format"

interface NoteCardProps {
  note: Note
}

export function NoteCard({ note }: NoteCardProps) {
  const preview = note.content
    ? note.content.replace(/[#*`>\-_]/g, "").trim().slice(0, 100)
    : null

  return (
    <Link to={`/notes/${note.id}`} className="group block">
      <Card className="h-full transition-all hover:shadow-md hover:border-primary/30 group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <CardHeader className="pb-2">
          <div className="flex items-start gap-2">
            <FileText className="size-4 text-muted-foreground mt-0.5 shrink-0" />
            <CardTitle className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {note.title}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0 flex flex-col gap-2">
          {preview && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {preview}
            </p>
          )}
          <div className="flex items-center justify-between gap-2 mt-auto">
            {note.category ? (
              <Badge variant="secondary" className="text-xs truncate max-w-[120px]">
                {note.category.name}
              </Badge>
            ) : (
              <span />
            )}
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDate(note.created_at)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
