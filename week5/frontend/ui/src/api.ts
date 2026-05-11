const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export interface Note {
  id: number;
  title: string;
  content: string;
}

export interface ActionItem {
  id: number;
  description: string;
  completed: boolean;
}

export interface Tag {
  id: number;
  name: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface ExtractionResult {
  tags: string[];
  action_items: string[];
}

export const api = {
  notes: {
    list: (page = 1, pageSize = 10) =>
      fetch(`${API_BASE}/notes/?page=${page}&page_size=${pageSize}`).then((r) => r.json() as Promise<PaginatedResponse<Note>>),
    search: (q: string, page = 1, pageSize = 10, sort = "created_desc") =>
      fetch(`${API_BASE}/notes/search/?q=${encodeURIComponent(q)}&page=${page}&page_size=${pageSize}&sort=${sort}`).then((r) => r.json() as Promise<PaginatedResponse<Note>>),
    get: (id: number) => fetch(`${API_BASE}/notes/${id}`).then((r) => r.json() as Promise<Note>),
    create: (data: { title: string; content: string }) =>
      fetch(`${API_BASE}/notes/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json() as Promise<Note>),
    update: (id: number, data: { title?: string; content?: string }) =>
      fetch(`${API_BASE}/notes/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json() as Promise<Note>),
    delete: (id: number) => fetch(`${API_BASE}/notes/${id}`, { method: "DELETE" }),
    extract: (id: number, apply = false) =>
      fetch(`${API_BASE}/notes/${id}/extract?apply=${apply}`).then((r) => r.json() as Promise<ExtractionResult>),
    listTags: (id: number) => fetch(`${API_BASE}/notes/${id}/tags/`).then((r) => r.json() as Promise<Tag[]>),
    attachTag: (noteId: number, tagId: number) =>
      fetch(`${API_BASE}/notes/${noteId}/tags/${tagId}`, { method: "POST" }).then((r) => r.json()),
    detachTag: (noteId: number, tagId: number) =>
      fetch(`${API_BASE}/notes/${noteId}/tags/${tagId}`, { method: "DELETE" }),
  },
  actionItems: {
    list: (completed?: boolean, page = 1, pageSize = 10) => {
      let url = `${API_BASE}/action-items/?page=${page}&page_size=${pageSize}`;
      if (completed !== undefined) url += `&completed=${completed}`;
      return fetch(url).then((r) => r.json() as Promise<PaginatedResponse<ActionItem>>);
    },
    create: (data: { description: string }) =>
      fetch(`${API_BASE}/action-items/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json() as Promise<ActionItem>),
    complete: (id: number) =>
      fetch(`${API_BASE}/action-items/${id}/complete`, { method: "PUT" }).then((r) => r.json() as Promise<ActionItem>),
    bulkComplete: (ids: number[]) =>
      fetch(`${API_BASE}/action-items/bulk-complete`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids }) }).then((r) => r.json() as Promise<ActionItem[]>),
  },
  tags: {
    list: () => fetch(`${API_BASE}/tags/`).then((r) => r.json() as Promise<Tag[]>),
    create: (name: string) =>
      fetch(`${API_BASE}/tags/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) }).then((r) => r.json() as Promise<Tag>),
    delete: (id: number) => fetch(`${API_BASE}/tags/${id}`, { method: "DELETE" }),
  },
};