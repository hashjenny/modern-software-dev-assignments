import { useState } from "react";
import { Note } from "../api";
import { NoteForm } from "./NoteForm";

interface NoteCardProps {
  note: Note;
  onUpdate: (id: number, title: string, content: string) => void;
  onDelete: (id: number) => void;
}

export function NoteCard({ note, onUpdate, onDelete }: NoteCardProps) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <NoteForm
        initialTitle={note.title}
        initialContent={note.content}
        submitLabel="Update"
        onSubmit={(title, content) => {
          onUpdate(note.id, title, content);
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "1rem",
        marginBottom: "0.5rem",
      }}
    >
      <h3 style={{ margin: "0 0 0.5rem 0" }}>{note.title}</h3>
      <p style={{ margin: "0 0 0.5rem 0", whiteSpace: "pre-wrap" }}>{note.content}</p>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button onClick={() => setEditing(true)}>Edit</button>
        <button onClick={() => onDelete(note.id)}>Delete</button>
      </div>
    </div>
  );
}