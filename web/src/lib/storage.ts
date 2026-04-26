export function saveToLocal<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function getFromLocal<T>(key: string): T | null {
  const data = localStorage.getItem(key);
  if (!data) return null;
  try {
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

export function removeFromLocal(key: string): void {
  localStorage.removeItem(key);
}
