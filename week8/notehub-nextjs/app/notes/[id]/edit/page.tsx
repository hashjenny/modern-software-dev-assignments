'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { NoteForm } from '@/components/NoteForm'
import { getNote, updateNote } from '@/lib/actions'
import styles from './page.module.css'

export default function EditNotePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [note, setNote] = useState<{ id: number; title: string; content: string | null; categoryId: number | null } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    params.then(({ id }) => {
      getNote(Number(id)).then(n => {
        setNote(n)
        setLoading(false)
      })
    })
  }, [params])

  async function handleSubmit(data: { title: string; content?: string; categoryId?: number }) {
    const { id } = await params
    await updateNote(Number(id), data)
    router.push(`/notes/${id}`)
    router.refresh()
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    )
  }

  if (!note) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Note not found</div>
      </div>
    )
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
            <h1 className={styles.title}>Edit Note</h1>
            <p className={styles.subtitle}>Make changes to your note</p>
          </div>
          <NoteForm onSubmit={handleSubmit} initialData={note} />
        </div>
      </main>
    </div>
  )
}
