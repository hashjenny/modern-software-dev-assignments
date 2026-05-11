import { useState } from "react";
import { NoteForm } from "./components/NoteForm";
import { NoteCard } from "./components/NoteCard";
import { ActionItems } from "./components/ActionItems";
import { useNotes, useActionItems, useTags } from "./hooks/useNotes";
import "./App.css";

export default function App() {
  const [activeTab, setActiveTab] = useState<"notes" | "action-items" | "tags">("notes");
  const notesHook = useNotes();
  const actionItemsHook = useActionItems();
  const tagsHook = useTags();

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1rem" }}>
      <h1>Week 5 App</h1>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", borderBottom: "1px solid #ccc" }}>
        <button onClick={() => setActiveTab("notes")} style={{ fontWeight: activeTab === "notes" ? "bold" : "normal" }}>
          Notes ({notesHook.total})
        </button>
        <button onClick={() => setActiveTab("action-items")} style={{ fontWeight: activeTab === "action-items" ? "bold" : "normal" }}>
          Action Items
        </button>
        <button onClick={() => setActiveTab("tags")} style={{ fontWeight: activeTab === "tags" ? "bold" : "normal" }}>
          Tags ({tagsHook.tags.length})
        </button>
      </div>

      {notesHook.error && <div style={{ color: "red" }}>{notesHook.error}</div>}

      {activeTab === "notes" && (
        <div>
          <NoteForm onSubmit={(title, content) => notesHook.createNote(title, content)} />

          <input
            type="text"
            placeholder="Search notes..."
            value={notesHook.searchQuery}
            onChange={(e) => notesHook.setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") notesHook.search(notesHook.searchQuery); }}
            style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
          />
          <button onClick={() => notesHook.search(notesHook.searchQuery)}>Search</button>

          {notesHook.loading && <p>Loading...</p>}

          <div>
            {notesHook.notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onUpdate={(id, title, content) => notesHook.updateNote(id, title, content)}
                onDelete={(id) => notesHook.deleteNote(id)}
              />
            ))}
          </div>

          {notesHook.notes.length === 0 && !notesHook.loading && (
            <p>No notes yet. Create one above!</p>
          )}
        </div>
      )}

      {activeTab === "action-items" && (
        <ActionItems
          items={actionItemsHook.items}
          onCreate={actionItemsHook.createItem}
          onComplete={actionItemsHook.completeItem}
          onBulkComplete={actionItemsHook.bulkComplete}
          filter={actionItemsHook.filter}
          onFilterChange={(f) => actionItemsHook.fetchItems(f ?? undefined)}
        />
      )}

      {activeTab === "tags" && (
        <div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.currentTarget.querySelector("input") as HTMLInputElement;
              if (input.value.trim()) {
                tagsHook.createTag(input.value.trim());
                input.value = "";
              }
            }}
            style={{ marginBottom: "1rem" }}
          >
            <input type="text" placeholder="New tag name" style={{ padding: "0.5rem" }} />
            <button type="submit" style={{ padding: "0.5rem 1rem" }}>Create Tag</button>
          </form>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {tagsHook.tags.map((tag) => (
              <span key={tag.id} style={{ background: "#eee", padding: "0.25rem 0.5rem", borderRadius: "4px", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                #{tag.name}
                <button onClick={() => tagsHook.deleteTag(tag.id)} style={{ padding: "0 0.25rem", fontSize: "0.8em" }}>x</button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}