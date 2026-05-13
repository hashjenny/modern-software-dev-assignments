import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { supabase, type Category, type Note } from "@/lib/supabase"
import { toast } from "sonner"
import { Loader as Loader2 } from "lucide-react"

interface NoteFormProps {
  note?: Note
  onSave?: (note: Note) => void
}

export function NoteForm({ note, onSave }: NoteFormProps) {
  const navigate = useNavigate()
  const [title, setTitle] = useState(note?.title ?? "")
  const [content, setContent] = useState(note?.content ?? "")
  const [categoryId, setCategoryId] = useState(note?.category_id ?? "none")
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<{ title?: string }>({})

  useEffect(() => {
    supabase.from("categories").select("*").order("name").then(({ data }) => {
      if (data) setCategories(data)
    })
  }, [])

  function validate() {
    const errs: { title?: string } = {}
    if (!title.trim()) errs.title = "Title is required"
    else if (title.length > 200) errs.title = "Title must be 200 characters or fewer"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)

    const payload = {
      title: title.trim(),
      content: content.trim() || null,
      category_id: categoryId === "none" ? null : categoryId,
    }

    let result
    if (note) {
      result = await supabase
        .from("notes")
        .update(payload)
        .eq("id", note.id)
        .select("*, category:categories(*)")
        .single()
    } else {
      result = await supabase
        .from("notes")
        .insert(payload)
        .select("*, category:categories(*)")
        .single()
    }

    setSaving(false)

    if (result.error) {
      toast.error("Failed to save note")
      return
    }

    toast.success(note ? "Note updated" : "Note created")
    if (onSave) onSave(result.data)
    else navigate(`/notes/${result.data.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          aria-invalid={!!errors.title}
          maxLength={200}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="category">Category</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger id="category" className="w-full">
            <SelectValue placeholder="No category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No category</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note here..."
          className="min-h-[280px] resize-y"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="size-4 animate-spin" />}
          {saving ? "Saving..." : note ? "Save Changes" : "Create Note"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(-1)}
          disabled={saving}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
