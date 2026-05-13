'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import styles from './SearchBar.module.css'

export function SearchBar({ defaultValue = '' }: { defaultValue?: string }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const query = inputRef.current?.value || ''
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      inputRef.current?.blur()
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`${styles.form} ${isFocused ? styles.focused : ''}`}>
      <div className={styles.searchIcon}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.3-4.3"/>
        </svg>
      </div>
      <input
        ref={inputRef}
        type="text"
        defaultValue={defaultValue}
        placeholder="Search your notes..."
        className={styles.input}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
      />
      {defaultValue && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={() => {
            if (inputRef.current) {
              inputRef.current.value = ''
              inputRef.current.focus()
            }
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      )}
      <button type="submit" className={styles.searchButton}>
        Search
      </button>
    </form>
  )
}
