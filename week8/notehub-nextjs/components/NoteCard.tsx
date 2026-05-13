import Link from 'next/link'
import styles from './NoteCard.module.css'

interface NoteCardProps {
  note: {
    id: number
    title: string
    content: string | null
    createdAt: Date
    category?: { id: number; name: string } | null
  }
}

export function NoteCard({ note }: NoteCardProps) {
  const preview = note.content?.slice(0, 120) || ''
  const formattedDate = new Date(note.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <Link href={`/notes/${note.id}`} className={styles.card}>
      <div className={styles.cardInner}>
        <div className={styles.cardHeader}>
          <time className={styles.date}>{formattedDate}</time>
          {note.category && (
            <span className={styles.category}>{note.category.name}</span>
          )}
        </div>
        <h3 className={styles.title}>{note.title}</h3>
        {preview && (
          <p className={styles.preview}>{preview}{note.content && note.content.length > 120 ? '...' : ''}</p>
        )}
        <div className={styles.arrow}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      </div>
    </Link>
  )
}
