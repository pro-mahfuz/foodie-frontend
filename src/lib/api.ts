const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

function unwrap<T>(value: unknown): T {
  const payload = value as { data?: unknown; content?: unknown };
  return (payload?.data ?? payload?.content ?? value) as T;
}

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("foodieToken");
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options?.headers || {}) },
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error("Your session has expired. Sign out and sign in again.");
    if (response.status === 403) throw new Error("An administrator account is required for this action.");
    const body = await response.text();
    let message = `Unable to save or load data (${response.status}). Please try again.`;
    try { const error = JSON.parse(body); message = error.message || error.detail || message; } catch { /* do not display raw server HTML */ }
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return unwrap<T>(await response.json());
}
