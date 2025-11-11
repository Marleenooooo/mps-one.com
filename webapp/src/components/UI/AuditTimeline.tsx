import React from 'react';

type AuditEntry = {
  entity: string;
  id: string;
  action: string;
  actorRole: string | null;
  actorType: string | null;
  at: number;
  comment?: string;
};

export function AuditTimeline({ entity, refId, title = 'Audit Timeline', limit = 6 }: { entity?: 'PR' | 'Quote' | 'PO' | 'DeliveryNote' | 'Invoice' | 'Payment'; refId?: string; title?: string; limit?: number }) {
  let entries: AuditEntry[] = [];
  try {
    const raw = localStorage.getItem('mpsone_audit_trail') || '{}';
    const map = JSON.parse(raw);
    if (entity && refId) {
      const key = `${entity}:${refId}`;
      const list = Array.isArray(map[key]) ? map[key] : [];
      entries = list;
    } else if (entity) {
      const prefix = `${entity}:`;
      const agg: AuditEntry[] = [];
      Object.keys(map).forEach(k => {
        if (k.startsWith(prefix) && Array.isArray(map[k])) {
          agg.push(...map[k]);
        }
      });
      entries = agg;
    } else {
      const all: AuditEntry[] = [];
      Object.keys(map).forEach(k => {
        if (Array.isArray(map[k])) all.push(...map[k]);
      });
      entries = all;
    }
    entries.sort((a, b) => b.at - a.at);
  } catch {}

  const sliced = entries.slice(0, limit);

  return (
    <div className="card" style={{ padding: 12, marginTop: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 14 }}>{title}</h3>
        <span className="status-badge info">{sliced.length} events</span>
      </div>
      {sliced.length === 0 ? (
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>No audit entries yet.</div>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {sliced.map((e, idx) => (
            <li key={idx} style={{ padding: '6px 0', display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8 }}>
              <span style={{ color: 'var(--text-secondary)' }}>{new Date(e.at).toLocaleString()}</span>
              <div>
                <span className="status-badge" style={{ marginRight: 8 }}>{e.action}</span>
                {e.comment ? <span style={{ color: 'var(--text-secondary)' }}>{e.comment}</span> : null}
                <div style={{ fontSize: 11, color: 'var(--text-disabled)' }}>
                  {e.actorType || 'unknown'} • {e.actorRole || 'unknown'} • {e.entity}:{e.id}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

