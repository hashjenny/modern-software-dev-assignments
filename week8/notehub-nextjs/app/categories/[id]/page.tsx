import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { NoteCard } from '@/components/NoteCard'
import styles from './page.module.css'

export default async function CategoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const category = await prisma.category.findUnique({
    where: { id: Number(id) },
    include: { notes: { include: { category: true } } },
  })

  if (!category) {
    notFound()
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/categories" className={styles.backLink}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            All Categories
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.categoryHeader}>
          <div className={styles.iconWrapper}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div>
            <h1 className={styles.title}>{category.name}</h1>
            <p className={styles.count}>{category.notes.length} {category.notes.length === 1 ? 'note' : 'notes'}</p>
          </div>
        </div>

        {category.notes.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No notes in this category yet.</p>
            <Link href="/notes/new" className={styles.emptyLink}>Create a note</Link>
          </div>
        ) : (
          <div className={styles.notesGrid}>
            {category.notes.map((note, index) => (
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
