export function generateId() {
  return `id-${Date.now()}-${Math.random().toString(36).substring(2)}`;
}
