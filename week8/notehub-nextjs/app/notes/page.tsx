import Link from 'next/link'
import { getNotes } from '@/lib/actions'
import { NoteCard } from '@/components/NoteCard'
import styles from './page.module.css'

export default async function NotesPage() {
  const { notes, total } = await getNotes(1, 50)

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/" className={styles.backLink}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Back
          </Link>
          <div className={styles.logo}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="var(--accent)"/>
              <path d="M10 10h12M10 16h8M10 22h10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>All Notes</h1>
            <p className={styles.subtitle}>{total} {total === 1 ? 'note' : 'notes'} total</p>
          </div>
          <Link href="/notes/new" className={styles.createButton}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            New Note
          </Link>
        </div>

        {notes.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="12" y="8" width="40" height="48" rx="6" stroke="var(--border-dark)" strokeWidth="2"/>
                <path d="M22 22h20M22 32h16M22 42h12" stroke="var(--border-dark)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h2>No notes yet</h2>
            <p>Start capturing your thoughts and ideas</p>
            <Link href="/notes/new" className={styles.emptyLink}>Create your first note</Link>
          </div>
        ) : (
          <div className={styles.notesGrid}>
            {notes.map((note, index) => (
              <div key={note.id} className={`animate-fade-in-up stagger-${Math.min(index + 1, 6)}`} style={{ opacity: 0 }}>
                <NoteCard note={note} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
