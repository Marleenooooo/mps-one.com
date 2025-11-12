export type NotificationRow = {
  id: number;
  user_id: number;
  module: 'procurement' | 'finance' | 'inventory' | 'reports' | 'alerts';
  title: string;
  body: string;
  type: 'info' | 'warning' | 'success' | 'error';
  is_read: 0 | 1;
  created_at: string;
};

import { getOfflineMode } from '../config';
const OFFLINE = getOfflineMode();

export async function listNotifications(params: { unread?: boolean; limit?: number } = {}): Promise<NotificationRow[]> {
  if (OFFLINE) return [];
  try {
    const q = new URLSearchParams();
    if (params.unread) q.set('unread', 'true');
    if (params.limit) q.set('limit', String(params.limit));
    const res = await fetch(`/api/notifications?${q.toString()}`);
    const json = await res.json();
    if (json?.ok) return json.rows || [];
  } catch {}
  return [];
}

export async function createNotification(data: { module: NotificationRow['module']; title: string; body: string; type?: NotificationRow['type']; }): Promise<number | null> {
  if (OFFLINE) return null;
  try {
    const res = await fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const json = await res.json();
    if (json?.ok) return Number(json.id);
  } catch {}
  return null;
}

export async function updateNotification(id: number, patch: { is_read?: boolean }): Promise<boolean> {
  if (OFFLINE) return true;
  try {
    const res = await fetch(`/api/notifications/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) });
    const json = await res.json();
    return !!json?.ok;
  } catch {
    return false;
  }
}
