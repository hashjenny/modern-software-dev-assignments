import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase, type Category } from "@/lib/supabase"
import { toast } from "sonner"
import { Loader as Loader2 } from "lucide-react"

interface CategoryFormProps {
  onSave?: (category: Category) => void
}

export function CategoryForm({ onSave }: CategoryFormProps) {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError("Category name is required"); return }
    if (name.length > 100) { setError("Name must be 100 characters or fewer"); return }
    setError("")
    setSaving(true)

    const { data, error: dbError } = await supabase
      .from("categories")
      .insert({ name: name.trim() })
      .select()
      .single()

    setSaving(false)

    if (dbError) {
      if (dbError.code === "23505") setError("A category with this name already exists")
      else toast.error("Failed to create category")
      return
    }

    toast.success("Category created")
    if (onSave) onSave(data)
    else navigate("/categories")
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          aria-invalid={!!error}
          maxLength={100}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="size-4 animate-spin" />}
          {saving ? "Saving..." : "Create Category"}
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={saving}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
