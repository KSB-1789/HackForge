export const messages = [];

export function nextMessageId() {
  if (messages.length === 0) return 1;
  const maxId = Math.max(...messages.map(m => Number(m.id) || 0));
  return maxId + 1;
}
