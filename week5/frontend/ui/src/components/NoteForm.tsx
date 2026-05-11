import { useState } from "react";

interface NoteFormProps {
  onSubmit: (title: string, content: string) => void;
  onCancel?: () => void;
  initialTitle?: string;
  initialContent?: string;
  submitLabel?: string;
}

export function NoteForm({
  onSubmit,
  onCancel,
  initialTitle = "",
  initialContent = "",
  submitLabel = "Create",
}: NoteFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      onSubmit(title.trim(), content.trim());
      if (!initialTitle) {
        setTitle("");
        setContent("");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem", minHeight: "100px" }}
      />
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} style={{ padding: "0.5rem 1rem" }}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}