'use client'

import { useRouter } from 'next/navigation'
import { CategoryForm } from '@/components/CategoryForm'
import { createCategory } from '@/lib/actions'
import styles from './page.module.css'

export default function NewCategoryPage() {
  const router = useRouter()

  async function handleSubmit(data: { name: string }) {
    await createCategory(data)
    router.push('/categories')
    router.refresh()
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <button onClick={() => router.back()} className={styles.backLink}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Cancel
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.formWrapper}>
          <div className={styles.formHeader}>
            <h1 className={styles.title}>New Category</h1>
            <p className={styles.subtitle}>Organize your notes with categories</p>
          </div>
          <CategoryForm onSubmit={handleSubmit} />
        </div>
      </main>
    </div>
  )
}
