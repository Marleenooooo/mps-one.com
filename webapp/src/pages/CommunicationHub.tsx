import React, { useMemo, useState, useEffect } from 'react';
import { useModule } from '../components/useModule';
import { useI18n } from '../components/I18nProvider';
import { uniqueId } from '../components/utils/uniqueId';

type Message = { id: string; from: string; body: string; status: 'sent'|'delivered'|'read'; when: string; attachments?: { name: string, size: number }[] };

export default function CommunicationHub() {
  useModule('procurement');
  const { t } = useI18n();
  const [thread, setThread] = useState<Message[]>([
    { id: uniqueId('msg'), from: 'PIC Procurement - Sari', body: 'Requesting updated quote for hydraulic hoses @PIC Finance - Damar', status: 'read', when: '09:20' },
    { id: uniqueId('msg'), from: 'PIC Finance - Damar', body: 'Approved budget, proceed to PO', status: 'delivered', when: '10:05' },
  ]);
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});

  const unread = useMemo(() => thread.filter(t => t.status !== 'read').length, [thread]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = Array.from(e.target.files ?? []);
    setFiles(prev => [...prev, ...f]);
    setProgress(p => ({ ...p, ...Object.fromEntries(f.map(ff => [ff.name, 0])) }));
  }

  function send() {
    if (!input.trim() && files.length === 0) return;
    const now = new Date().toLocaleTimeString();
    const attachments = files.map(f => ({ name: f.name, size: f.size }));
    const newMsg: Message = { id: uniqueId('msg'), from: 'You', body: input, status: 'sent', when: now, attachments };
    setThread(t => [...t, newMsg]);
    setInput('');
    // simulate upload progress
    if (files.length) {
      const names = files.map(f => f.name);
      const interval = setInterval(() => {
        setProgress(prev => {
          const next: Record<string, number> = { ...prev };
          let done = true;
          for (const n of names) {
            const val = Math.min(100, (next[n] ?? 0) + Math.floor(15 + Math.random() * 25));
            next[n] = val;
            if (val < 100) done = false;
          }
          if (done) {
            clearInterval(interval);
            setFiles([]);
            // after upload completes, mark as delivered then read
            setTimeout(() => setThread(t => t.map(m => m.id === newMsg.id ? { ...m, status: 'delivered' } : m)), 400);
            setTimeout(() => setThread(t => t.map(m => m.id === newMsg.id ? { ...m, status: 'read' } : m)), 1500);
          }
          return next;
        });
      }, 300);
    } else {
      // no attachments: still simulate receipt
      setTimeout(() => setThread(t => t.map(m => m.id === newMsg.id ? { ...m, status: 'delivered' } : m)), 300);
      setTimeout(() => setThread(t => t.map(m => m.id === newMsg.id ? { ...m, status: 'read' } : m)), 1200);
    }
  }

  return (
    <div className="main">
      <div className="page-header procurement">
        <h1 style={{ margin: 0 }}>{t('comms.title')}</h1>
      </div>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ marginTop: 0 }}>{t('comms.threads')}</h2>
          <div className="status-badge info">{t('comms.unread').replace('{n}', String(unread))}</div>
        </div>
        <div role="list" aria-label="Conversation" style={{ display: 'grid', gap: 8, marginTop: 12 }}>
          {thread.map(m => (
            <div role="listitem" key={m.id} className="card" style={{ padding: 12, borderLeft: `4px solid ${m.status === 'read' ? 'var(--border)' : 'var(--accent)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{m.from}</strong>
                <span style={{ color: 'var(--text-secondary)' }}>{m.when}</span>
              </div>
              <div style={{ marginTop: 4 }}>{m.body}</div>
              {m.attachments && m.attachments.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t('comms.attachments')}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                    {m.attachments.map(a => (
                      <span key={a.name} className="status-badge info" title={`${a.name} • ${(a.size/1024).toFixed(1)} KB`}>{a.name}</span>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <span className="status-badge" style={{ background: m.status === 'read' ? 'linear-gradient(135deg,#39FF14 0%,#00CC66 100%)' : m.status === 'delivered' ? 'linear-gradient(135deg,#FFB800 0%,#FF5E00 100%)' : 'linear-gradient(135deg,#0077FF 0%, #0055CC 100%)', color: '#0A0F2D' }}>
                  {m.status === 'read' ? `✓✓ ${t('comms.status.read')}` : m.status === 'delivered' ? `✓ ${t('comms.status.delivered')}` : t('comms.status.sent')}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, marginTop: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="input" placeholder={t('comms.input_placeholder')} value={input} onChange={e => setInput(e.target.value)} />
            <label className="btn" style={{ cursor: 'pointer' }}>
              {t('comms.add_attachments')}
              <input type="file" multiple onChange={onFileChange} style={{ display: 'none' }} />
            </label>
          </div>
          <button className="btn primary" onClick={send} aria-busy={files.length > 0 && Object.values(progress).some(p => p < 100)}>{t('action.send') || 'Send'}</button>
        </div>
        {files.length > 0 && (
          <div className="card" style={{ padding: 12, marginTop: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t('comms.uploading')}</div>
            <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
              {files.map(f => (
                <div key={f.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{f.name}</span>
                    <span>{Math.min(100, progress[f.name] ?? 0)}%</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 6, background: 'var(--border)' }}>
                    <div style={{ width: `${Math.min(100, progress[f.name] ?? 0)}%`, height: '100%', borderRadius: 6, background: 'linear-gradient(90deg,#00F0FF 0%,#0077FF 100%)' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="card" style={{ padding: 16, marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>{t('comms.email_integration')}</h2>
        <p style={{ color: 'var(--text-secondary)' }}>{t('comms.email_sync_desc')}</p>
        <div className="status-badge info">{t('comms.connected_to').replace('{email}', 'admin@mpsone.co.id')}</div>
      </div>
    </div>
  );
}
