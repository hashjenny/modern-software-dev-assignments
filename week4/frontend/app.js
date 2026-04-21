async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function loadNotes(q = "") {
  const list = document.getElementById("notes");
  list.innerHTML = "";
  const url = q ? `/notes/search/?q=${encodeURIComponent(q)}` : "/notes/";
  const notes = await fetchJSON(url);
  for (const n of notes) {
    const li = document.createElement("li");
    li.textContent = `${n.title}: ${n.content}`;

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.onclick = () => {
      document.getElementById("note-title").value = n.title;
      document.getElementById("note-content").value = n.content;
      document.getElementById("note-form").dataset.editId = n.id;
      document.getElementById("note-form").querySelector('button[type="submit"]').textContent = "Update";
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = async () => {
      await fetch(`/notes/${n.id}`, { method: "DELETE" });
      loadNotes();
    };

    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  }
}

async function loadActions() {
  const list = document.getElementById("actions");
  list.innerHTML = "";
  const items = await fetchJSON("/action-items/");
  for (const a of items) {
    const li = document.createElement("li");
    li.textContent = `${a.description} [${a.completed ? "done" : "open"}]`;
    if (!a.completed) {
      const btn = document.createElement("button");
      btn.textContent = "Complete";
      btn.onclick = async () => {
        await fetchJSON(`/action-items/${a.id}/complete`, { method: "PUT" });
        loadActions();
      };
      li.appendChild(btn);
    }
    list.appendChild(li);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const noteForm = document.getElementById("note-form");
  const searchInput = document.getElementById("note-search");
  let debounceTimer;

  noteForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("note-title").value;
    const content = document.getElementById("note-content").value;
    const editId = noteForm.dataset.editId;

    if (editId) {
      await fetchJSON(`/notes/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      delete noteForm.dataset.editId;
      noteForm.querySelector('button[type="submit"]').textContent = "Add";
    } else {
      await fetchJSON("/notes/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
    }
    e.target.reset();
    loadNotes();
  });

  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      loadNotes(searchInput.value);
    }, 300);
  });

  document.getElementById("action-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const description = document.getElementById("action-desc").value;
    await fetchJSON("/action-items/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });
    e.target.reset();
    loadActions();
  });

  loadNotes();
  loadActions();
});
