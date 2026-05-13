'use client'

import { useForm, SubmitHandler } from 'react-hook-form'
import { useEffect, useState } from 'react'
import styles from './NoteForm.module.css'

interface FormData {
  title: string
  content: string
  categoryId: string
}

interface NoteFormProps {
  onSubmit: (data: { title: string; content?: string; categoryId?: number }) => void
  initialData?: { id: number; title: string; content: string | null; categoryId: number | null }
}

interface Category {
  id: number
  name: string
}

export function NoteForm({ onSubmit, initialData }: NoteFormProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      categoryId: initialData?.categoryId?.toString() || '',
    }
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [isFocused, setIsFocused] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(() => setCategories([]))
  }, [])

  const onFormSubmit: SubmitHandler<FormData> = (data) => {
    onSubmit({
      title: data.title,
      content: data.content,
      categoryId: data.categoryId ? parseInt(data.categoryId) : undefined
    })
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className={styles.form}>
      <div className={`${styles.field} ${errors.title ? styles.fieldError : ''} ${isFocused === 'title' ? styles.fieldFocused : ''}`}>
        <label className={styles.label}>
          <span className={styles.labelText}>Title</span>
          <span className={styles.required}>Required</span>
        </label>
        <input
          {...register('title', { required: true, maxLength: 200 })}
          className={styles.input}
          placeholder="Give your note a title..."
          onFocus={() => setIsFocused('title')}
          onBlur={() => setIsFocused(null)}
        />
        {errors.title && <span className={styles.error}>Title is required</span>}
      </div>

      <div className={`${styles.field} ${isFocused === 'content' ? styles.fieldFocused : ''}`}>
        <label className={styles.label}>
          <span className={styles.labelText}>Content</span>
          <span className={styles.optional}>Optional</span>
        </label>
        <textarea
          {...register('content')}
          className={styles.textarea}
          placeholder="What's on your mind?"
          rows={8}
          onFocus={() => setIsFocused('content')}
          onBlur={() => setIsFocused(null)}
        />
      </div>

      <div className={`${styles.field} ${isFocused === 'categoryId' ? styles.fieldFocused : ''}`}>
        <label className={styles.label}>
          <span className={styles.labelText}>Category</span>
          <span className={styles.optional}>Optional</span>
        </label>
        <select
          {...register('categoryId')}
          className={styles.select}
          onFocus={() => setIsFocused('categoryId')}
          onBlur={() => setIsFocused(null)}
        >
          <option value="">No category</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>
          ))}
        </select>
      </div>

      <button type="submit" className={styles.submit}>
        {initialData ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            Update Note
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Create Note
          </>
        )}
      </button>
    </form>
  )
}
