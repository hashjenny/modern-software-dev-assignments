import Link from 'next/link'
import styles from './CategoryCard.module.css'

interface CategoryCardProps {
  category: {
    id: number
    name: string
    _count: { notes: number }
  }
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/categories/${category.id}`} className={styles.card}>
      <div className={styles.iconWrapper}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
      </div>
      <div className={styles.content}>
        <h3 className={styles.name}>{category.name}</h3>
        <span className={styles.count}>
          {category._count.notes} {category._count.notes === 1 ? 'note' : 'notes'}
        </span>
      </div>
      <div className={styles.arrow}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </div>
    </Link>
  )
}
