import React, { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../components/I18nProvider';
import { listNotifications, updateNotification, NotificationRow } from '../services/notifications';

type NotificationItem = {
  id: string;
  module: 'procurement' | 'finance' | 'inventory' | 'reports' | 'alerts';
  title: string;
  body: string;
  type: 'info' | 'warning' | 'success' | 'error';
  is_read: boolean;
  created_at: string;
};

const STORE_KEY = 'mock_notifications';

function load(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // Seed defaults
  const seed: NotificationItem[] = [
    { id: 'n1', module: 'procurement', title: 'PR Approved', body: 'PR #PR-1024 approved by Finance', type: 'success', is_read: false, created_at: new Date().toISOString() },
    { id: 'n2', module: 'inventory', title: 'Delivery Confirmed', body: 'PO #PO-2003 received with corrections', type: 'info', is_read: false, created_at: new Date().toISOString() },
    { id: 'n3', module: 'finance', title: 'Invoice Due', body: 'Invoice #INV-7789 due in 3 days', type: 'warning', is_read: true, created_at: new Date().toISOString() },
  ];
  try { localStorage.setItem(STORE_KEY, JSON.stringify(seed)); } catch {}
  return seed;
}

export default function Notifications() {
  const { t } = useI18n();
  const [rows, setRows] = useState<NotificationItem[]>(() => load());

  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(rows)); } catch {}
  }, [rows]);

  useEffect(() => {
    // Try to load from backend first
    (async () => {
      const apiRows: NotificationRow[] = await listNotifications({ limit: 100 });
      if (apiRows && apiRows.length) {
        const mapped: NotificationItem[] = apiRows.map(r => ({ id: String(r.id), module: r.module, title: r.title, body: r.body, type: r.type, is_read: !!r.is_read, created_at: r.created_at }));
        setRows(mapped);
        try { localStorage.setItem(STORE_KEY, JSON.stringify(mapped)); } catch {}
      }
    })();
  }, []);

  const unread = useMemo(() => rows.filter(r => !r.is_read).length, [rows]);

  const markAllRead = async () => {
    setRows(rs => rs.map(r => ({ ...r, is_read: true })));
    // Fire-and-forget backend updates
    rows.filter(r => !r.is_read).forEach(r => { updateNotification(Number(r.id), { is_read: true }); });
  };
  const toggleRead = async (id: string) => {
    setRows(rs => rs.map(r => r.id === id ? ({ ...r, is_read: !r.is_read }) : r));
    const target = rows.find(r => r.id === id);
    if (target) updateNotification(Number(id), { is_read: !target.is_read });
  };

  const moduleColor = (m: NotificationItem['module']) => {
    switch (m) {
      case 'procurement': return 'var(--module-color)';
      case 'finance': return '#FF00E5';
      case 'inventory': return '#39FF14';
      case 'reports': return '#FFB800';
      case 'alerts': return '#FF2A50';
    }
  };

  return (
    <div className="main">
      <div className="page" aria-labelledby="notif-title">
        <h1 id="notif-title" className="page-title">{t('topbar.notifications') || 'Notifications'} ({unread} {t('topbar.unread') || 'unread'})</h1>

        <div className="card accent-border" style={{ padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 600 }}>{t('notifications.center') || 'Notification Center'}</div>
            <div>
              <button className="btn outline" onClick={markAllRead}>{t('notifications.mark_all_read') || 'Mark all as read'}</button>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
            {rows.map(r => (
              <div key={r.id} className="card" style={{ padding: 10, borderLeft: `3px solid ${moduleColor(r.module)}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600 }}>{r.title}</span>
                    {!r.is_read && <span className="status-badge info">{t('topbar.unread') || 'unread'}</span>}
                  </div>
                  <button className="btn ghost" onClick={() => toggleRead(r.id)}>{r.is_read ? (t('notifications.mark_unread') || 'Mark as unread') : (t('notifications.mark_read') || 'Mark as read')}</button>
                </div>
                <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{r.body}</div>
                <div style={{ fontSize: 12, color: 'var(--text-disabled)', marginTop: 6 }}>{new Date(r.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
