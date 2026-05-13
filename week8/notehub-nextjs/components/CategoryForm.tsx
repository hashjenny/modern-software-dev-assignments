'use client'

import { useForm, SubmitHandler } from 'react-hook-form'
import { useState } from 'react'
import styles from './CategoryForm.module.css'

interface FormData {
  name: string
}

interface CategoryFormProps {
  onSubmit: (data: { name: string }) => void
}

export function CategoryForm({ onSubmit }: CategoryFormProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>()
  const [isFocused, setIsFocused] = useState(false)

  const onFormSubmit: SubmitHandler<FormData> = (data) => {
    onSubmit(data)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className={styles.form}>
      <div className={`${styles.field} ${errors.name ? styles.fieldError : ''} ${isFocused ? styles.fieldFocused : ''}`}>
        <label className={styles.label}>
          <span className={styles.labelText}>Category Name</span>
        </label>
        <input
          {...register('name', { required: true, maxLength: 100 })}
          className={styles.input}
          placeholder="e.g., Work, Personal, Ideas..."
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {errors.name && <span className={styles.error}>Category name is required</span>}
      </div>

      <button type="submit" className={styles.submit}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        Create Category
      </button>
    </form>
  )
}
