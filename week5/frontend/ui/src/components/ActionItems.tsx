import { useState } from "react";
import { ActionItem } from "../api";

interface ActionItemsProps {
  items: ActionItem[];
  onCreate: (description: string) => void;
  onComplete: (id: number) => void;
  onBulkComplete: (ids: number[]) => void;
  filter: boolean | null;
  onFilterChange: (filter: boolean | null) => void;
}

export function ActionItems({
  items,
  onCreate,
  onComplete,
  onBulkComplete,
  filter,
  onFilterChange,
}: ActionItemsProps) {
  const [newItem, setNewItem] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim()) {
      onCreate(newItem.trim());
      setNewItem("");
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const incomplete = items.filter((i) => !i.completed);
  const completed = items.filter((i) => i.completed);

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="New action item"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          style={{ padding: "0.5rem", width: "70%" }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Add
        </button>
      </form>

      {selectedIds.length > 0 && (
        <button onClick={() => { onBulkComplete(selectedIds); setSelectedIds([]); }} style={{ marginBottom: "1rem" }}>
          Complete Selected ({selectedIds.length})
        </button>
      )}

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button onClick={() => onFilterChange(null)} style={{ fontWeight: filter === null ? "bold" : "normal" }}>
          All
        </button>
        <button onClick={() => onFilterChange(false)} style={{ fontWeight: filter === false ? "bold" : "normal" }}>
          Active
        </button>
        <button onClick={() => onFilterChange(true)} style={{ fontWeight: filter === true ? "bold" : "normal" }}>
          Completed
        </button>
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {(filter === null ? items : filter === false ? incomplete : completed).map((item) => (
          <li key={item.id} style={{ padding: "0.5rem", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {!item.completed && (
              <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)} />
            )}
            <span style={{ textDecoration: item.completed ? "line-through" : "none", flex: 1 }}>
              {item.description}
            </span>
            {!item.completed && (
              <button onClick={() => onComplete(item.id)}>Done</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}