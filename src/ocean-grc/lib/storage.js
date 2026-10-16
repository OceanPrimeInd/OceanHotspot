const keyFor = (userId) => `ocean_hotspot_regulations_${userId}`;

function readAll(userId) {
  try {
    const raw = localStorage.getItem(keyFor(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(userId, rows) {
  localStorage.setItem(keyFor(userId), JSON.stringify(rows));
}

export async function saveConversation(userId, _userEmail, id, title, messages) {
  const rows = readAll(userId).filter((row) => row.id !== id);
  rows.unshift({
    id,
    title: title || "Untitled",
    messages,
    updatedAt: Date.now(),
  });
  writeAll(userId, rows);
}

export async function loadConversation(userId, id) {
  return readAll(userId).find((row) => row.id === id)?.messages || [];
}

export async function listConversations(userId) {
  return readAll(userId)
    .slice()
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map((row) => ({ id: row.id, title: row.title, updatedAt: row.updatedAt }));
}

export async function deleteConversation(userId, id) {
  writeAll(
    userId,
    readAll(userId).filter((row) => row.id !== id),
  );
}
