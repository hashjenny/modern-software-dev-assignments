import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getNote, deleteNote } from '@/lib/actions'
import { DeleteButton } from '@/components/DeleteButton'
import styles from './page.module.css'

export default async function NoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const note = await getNote(Number(id))

  if (!note) {
    notFound()
  }

  const formattedDate = new Date(note.createdAt).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  async function handleDelete() {
    'use server'
    await deleteNote(Number(id), '/notes')
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/notes" className={styles.backLink}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            All Notes
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        <article className={styles.article}>
          <header className={styles.articleHeader}>
            <div className={styles.meta}>
              <time className={styles.date}>{formattedDate}</time>
              {note.category && (
                <span className={styles.category}>{note.category.name}</span>
              )}
            </div>
            <h1 className={styles.title}>{note.title}</h1>
          </header>

          <div className={styles.content}>
            {note.content ? (
              <p className={styles.text}>{note.content}</p>
            ) : (
              <p className={styles.noContent}>This note has no content yet.</p>
            )}
          </div>

          <footer className={styles.actions}>
            <Link href={`/notes/${id}/edit`} className={styles.editButton}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit Note
            </Link>
            <form action={handleDelete} className={styles.deleteForm}>
              <DeleteButton />
            </form>
          </footer>
        </article>
      </main>
    </div>
  )
}
