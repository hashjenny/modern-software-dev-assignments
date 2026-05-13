import Link from 'next/link'
import { getCategories } from '@/lib/actions'
import { CategoryCard } from '@/components/CategoryCard'
import styles from './page.module.css'

export default async function CategoriesPage() {
  const categories = await getCategories()

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
            <h1 className={styles.title}>Categories</h1>
            <p className={styles.subtitle}>{categories.length} {categories.length === 1 ? 'category' : 'categories'}</p>
          </div>
          <Link href="/categories/new" className={styles.createButton}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            New Category
          </Link>
        </div>

        {categories.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M56 26a4 4 0 0 0-4-4H26l-6-6a4 4 0 0 0-6 0l-16 16a4 4 0 0 0 0 6l12 12a4 4 0 0 0 6 0l8-8v26a4 4 0 0 0 4 4h16a4 4 0 0 0 4-4V30a4 4 0 0 0-2-3.5" stroke="var(--border-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2>No categories yet</h2>
            <p>Organize your notes with categories</p>
            <Link href="/categories/new" className={styles.emptyLink}>Create a category</Link>
          </div>
        ) : (
          <div className={styles.categoriesList}>
            {categories.map((category, index) => (
              <div key={category.id} className={`animate-fade-in-up stagger-${Math.min(index + 1, 6)}`} style={{ opacity: 0 }}>
                <CategoryCard category={category} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
