import Link from 'next/link'
import { searchNotes } from '@/lib/actions'
import { NoteCard } from '@/components/NoteCard'
import { SearchBar } from '@/components/SearchBar'
import styles from './page.module.css'

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const query = q || ''
  const results = query ? await searchNotes(query) : []

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
        <div className={styles.searchSection}>
          <h1 className={styles.title}>Search Notes</h1>
          <div className={styles.searchWrapper}>
            <SearchBar defaultValue={query} />
          </div>
        </div>

        {query && (
          <div className={styles.results}>
            <p className={styles.resultCount}>
              {results.length === 0 ? 'No results' : `${results.length} ${results.length === 1 ? 'result' : 'results'}`}
              {' '}for &ldquo;{query}&rdquo;
            </p>

            {results.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="28" cy="28" r="16" stroke="var(--border-dark)" strokeWidth="2"/>
                    <path d="M40 40l12 12" stroke="var(--border-dark)" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <p>Try different keywords or browse all notes</p>
                <Link href="/notes" className={styles.emptyLink}>Browse all notes</Link>
              </div>
            ) : (
              <div className={styles.notesGrid}>
                {results.map((note, index) => (
                  <div key={note.id} className={`animate-fade-in-up stagger-${Math.min(index + 1, 6)}`} style={{ opacity: 0 }}>
                    <NoteCard note={note} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!query && (
          <div className={styles.hint}>
            <p>Enter a search term to find notes by title or content</p>
          </div>
        )}
      </main>
    </div>
  )
}
