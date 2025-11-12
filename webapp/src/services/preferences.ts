export type UserPreferences = {
  user_id: number;
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'id';
  notify_inapp: number; // 0/1
  notify_email: number; // 0/1
  updated_at: string;
} | null;

export async function getUserPreferences(): Promise<UserPreferences> {
  try {
    const res = await fetch('/api/user/preferences');
    const json = await res.json();
    if (json?.ok) return json.row || null;
  } catch {}
  return null;
}

export async function updateUserPreferences(prefs: { theme?: 'light'|'dark'|'system'; language?: 'en'|'id'; notify_inapp?: boolean; notify_email?: boolean; }): Promise<boolean> {
  try {
    const res = await fetch('/api/user/preferences', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(prefs) });
    const json = await res.json();
    return !!json?.ok;
  } catch {
    return false;
  }
}
