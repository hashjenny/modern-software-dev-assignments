import Link from 'next/link'
import { getNotes } from '@/lib/actions'
import { NoteCard } from '@/components/NoteCard'
import styles from './page.module.css'

export default async function HomePage() {
  const { notes } = await getNotes(1, 10)

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="var(--accent)"/>
              <path d="M10 10h12M10 16h8M10 22h10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>NoteHub</span>
          </div>
          <nav className={styles.nav}>
            <Link href="/notes">Notes</Link>
            <Link href="/categories">Categories</Link>
            <Link href="/search" className={styles.searchLink}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
              </svg>
            </Link>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={`${styles.heroTitle} animate-fade-in-up`}>
            Your thoughts,<br />
            <em>beautifully organized</em>
          </h1>
          <p className={`${styles.heroSubtitle} animate-fade-in-up stagger-1`}>
            A quiet space for your ideas, reflections, and everything in between.
          </p>
        </section>

        <section className={styles.recentSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Notes</h2>
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
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="8" y="6" width="32" height="36" rx="4" stroke="var(--border-dark)" strokeWidth="2"/>
                  <path d="M16 16h16M16 24h12M16 32h8" stroke="var(--border-dark)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <p>No notes yet. Start capturing your thoughts.</p>
              <Link href="/notes/new" className={styles.emptyLink}>Create your first note</Link>
            </div>
          ) : (
            <div className={styles.notesGrid}>
              {notes.map((note, index) => (
                <div key={note.id} className={`animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}>
                  <NoteCard note={note} />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className={styles.footer}>
        <p>NoteHub — Where ideas find their place</p>
      </footer>
    </div>
  )
}
