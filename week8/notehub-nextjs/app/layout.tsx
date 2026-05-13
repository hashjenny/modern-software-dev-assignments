import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NoteHub — Your Thoughtful Space',
  description: 'A beautiful place to capture and organize your thoughts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
