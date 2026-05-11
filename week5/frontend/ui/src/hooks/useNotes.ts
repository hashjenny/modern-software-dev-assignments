import { useEffect, useState, useCallback } from "react";
import { api, Note, ActionItem, Tag, PaginatedResponse } from "../api";

interface OptimisticNote extends Note {
  _optimistic?: boolean;
}

export function useNotes() {
  const [notes, setNotes] = useState<OptimisticNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PaginatedResponse<Note> | null>(null);

  const fetchNotes = useCallback(async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.notes.list(pageNum, 10);
      setNotes(result.items);
      setTotal(result.total);
      setPage(pageNum);
    } catch (e) {
      setError("Failed to fetch notes");
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback(async (q: string, pageNum = 1) => {
    if (!q.trim()) {
      setSearchResults(null);
      return;
    }
    setLoading(true);
    try {
      const result = await api.notes.search(q, pageNum, 10);
      setSearchResults(result);
    } catch (e) {
      setError("Search failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const createNote = useCallback(async (title: string, content: string) => {
    const tempId = Date.now();
    const optimisticNote: OptimisticNote = { id: tempId, title, content, _optimistic: true };
    setNotes((prev) => [optimisticNote, ...prev]);
    setTotal((prev) => prev + 1);

    try {
      const created = await api.notes.create({ title, content });
      setNotes((prev) => prev.map((n) => (n.id === tempId ? created : n)));
    } catch (e) {
      setNotes((prev) => prev.filter((n) => n.id !== tempId));
      setTotal((prev) => prev - 1);
      setError("Failed to create note");
    }
  }, []);

  const updateNote = useCallback(async (id: number, title: string, content: string) => {
    const original = notes.find((n) => n.id === id);
    if (!original) return;

    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, title, content } : n))
    );

    try {
      const updated = await api.notes.update(id, { title, content });
      setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
    } catch (e) {
      setNotes((prev) => prev.map((n) => (n.id === id ? original : n)));
      setError("Failed to update note");
    }
  }, [notes]);

  const deleteNote = useCallback(async (id: number) => {
    const original = notes;
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setTotal((prev) => prev - 1);

    try {
      await api.notes.delete(id);
    } catch (e) {
      setNotes(original);
      setTotal((prev) => prev + 1);
      setError("Failed to delete note");
    }
  }, []);

  useEffect(() => {
    fetchNotes(1);
  }, [fetchNotes]);

  return {
    notes: searchResults ? searchResults.items : notes,
    loading,
    error,
    page,
    total,
    searchQuery,
    setSearchQuery,
    search,
    createNote,
    updateNote,
    deleteNote,
    fetchNotes,
    isSearching: searchResults !== null,
  };
}

export function useActionItems() {
  const [items, setItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<boolean | null>(null);

  const fetchItems = useCallback(async (completed?: boolean) => {
    setLoading(true);
    try {
      const result = await api.actionItems.list(completed, 1, 50);
      setItems(result.items);
      setFilter(completed ?? null);
    } catch (e) {
      console.error("Failed to fetch action items", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const createItem = useCallback(async (description: string) => {
    try {
      const created = await api.actionItems.create({ description });
      setItems((prev) => [created, ...prev]);
    } catch (e) {
      console.error("Failed to create action item", e);
    }
  }, []);

  const completeItem = useCallback(async (id: number) => {
    const original = items;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, completed: true } : i)));

    try {
      const updated = await api.actionItems.complete(id);
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
    } catch (e) {
      setItems(original);
      console.error("Failed to complete item", e);
    }
  }, [items]);

  const bulkComplete = useCallback(async (ids: number[]) => {
    const original = items;
    setItems((prev) =>
      prev.map((i) => (ids.includes(i.id) ? { ...i, completed: true } : i))
    );

    try {
      await api.actionItems.bulkComplete(ids);
    } catch (e) {
      setItems(original);
      console.error("Failed to bulk complete", e);
    }
  }, [items]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, loading, filter, fetchItems, createItem, completeItem, bulkComplete };
}

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);

  const fetchTags = useCallback(async () => {
    try {
      const result = await api.tags.list();
      setTags(result);
    } catch (e) {
      console.error("Failed to fetch tags", e);
    }
  }, []);

  const createTag = useCallback(async (name: string) => {
    try {
      const created = await api.tags.create(name);
      setTags((prev) => [...prev, created]);
    } catch (e) {
      console.error("Failed to create tag", e);
    }
  }, []);

  const deleteTag = useCallback(async (id: number) => {
    try {
      await api.tags.delete(id);
      setTags((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      console.error("Failed to delete tag", e);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return { tags, fetchTags, createTag, deleteTag };
}