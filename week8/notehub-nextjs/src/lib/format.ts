import { format, formatDistanceToNow } from "date-fns"

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  if (diffDays < 1) return formatDistanceToNow(date, { addSuffix: true })
  if (diffDays < 7) return format(date, "EEE, MMM d")
  return format(date, "MMM d, yyyy")
}

export function formatDateFull(dateStr: string): string {
  return format(new Date(dateStr), "MMMM d, yyyy 'at' h:mm a")
}
