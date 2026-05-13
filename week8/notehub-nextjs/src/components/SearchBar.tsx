import { useState, type KeyboardEvent } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface SearchBarProps {
  defaultValue?: string
  onSearch: (query: string) => void
  placeholder?: string
}

export function SearchBar({ defaultValue = "", onSearch, placeholder = "Search notes..." }: SearchBarProps) {
  const [value, setValue] = useState(defaultValue)

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && value.trim()) {
      onSearch(value.trim())
    }
  }

  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
      <Input
        className="pl-8"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  )
}
