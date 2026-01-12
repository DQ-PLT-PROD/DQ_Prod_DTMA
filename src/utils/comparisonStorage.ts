// Utility for persisting comparison selections by marketplace type in localStorage
// We persist only IDs to keep storage small and rehydrate from fetched items later.

const STORAGE_PREFIX = "compare:";

function keyFor(type: string) {
  return `${STORAGE_PREFIX}${type}`;
}

export function getStoredCompareIds(type: string): string[] {
  try {
    const raw = localStorage.getItem(keyFor(type));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setStoredCompareIds(type: string, ids: string[]) {
  try {
    localStorage.setItem(keyFor(type), JSON.stringify(ids.slice(0, 3)));
  } catch {
    // no-op
  }
}

export function addCompareId(type: string, id: string) {
  const ids = getStoredCompareIds(type);
  if (ids.includes(id)) return;
  ids.push(id);
  setStoredCompareIds(type, ids);
}

export function removeCompareId(type: string, id: string) {
  const ids = getStoredCompareIds(type).filter((x) => x !== id);
  setStoredCompareIds(type, ids);
}

export function clearCompare(type: string) {
  try {
    localStorage.removeItem(keyFor(type));
  } catch {
    // no-op
  }
}
