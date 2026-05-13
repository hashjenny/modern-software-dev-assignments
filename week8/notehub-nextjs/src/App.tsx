import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import { AppLayout } from "@/components/AppLayout"
import { NotesListPage } from "@/pages/NotesListPage"
import { NoteDetailPage } from "@/pages/NoteDetailPage"
import { NoteNewPage } from "@/pages/NoteNewPage"
import { NoteEditPage } from "@/pages/NoteEditPage"
import { CategoriesPage } from "@/pages/CategoriesPage"
import { CategoryDetailPage } from "@/pages/CategoryDetailPage"
import { CategoryNewPage } from "@/pages/CategoryNewPage"
import { SearchPage } from "@/pages/SearchPage"
import { Toaster } from "@/components/ui/sonner"

export function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="notehub-theme">
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/notes" replace />} />
            <Route path="/notes" element={<NotesListPage />} />
            <Route path="/notes/new" element={<NoteNewPage />} />
            <Route path="/notes/:id" element={<NoteDetailPage />} />
            <Route path="/notes/:id/edit" element={<NoteEditPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/categories/new" element={<CategoryNewPage />} />
            <Route path="/categories/:id" element={<CategoryDetailPage />} />
            <Route path="/search" element={<SearchPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  )
}

export default App
