import React, { useMemo, useState } from 'react';

type Message = { id: number; from: string; body: string; read: boolean; when: string };

export default function CommunicationHub() {
  const [thread, setThread] = useState<Message[]>([
    { id: 1, from: 'PIC Procurement - Sari', body: 'Requesting updated quote for hydraulic hoses @PIC Finance - Damar', read: true, when: '09:20' },
    { id: 2, from: 'PIC Finance - Damar', body: 'Approved budget, proceed to PO', read: false, when: '10:05' },
  ]);
  const [input, setInput] = useState('');

  const unread = useMemo(() => thread.filter(t => !t.read).length, [thread]);

  function send() {
    if (!input.trim()) return;
    setThread(t => [...t, { id: Date.now(), from: 'You', body: input, read: false, when: new Date().toLocaleTimeString() }]);
    setInput('');
  }

  return (
    <div className="main">
      <h1>Communication Hub</h1>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ marginTop: 0 }}>Threads</h2>
          <div className="status-badge info">Unread: {unread}</div>
        </div>
        <div role="list" aria-label="Conversation" style={{ display: 'grid', gap: 8, marginTop: 12 }}>
          {thread.map(m => (
            <div role="listitem" key={m.id} className="card" style={{ padding: 12, borderLeft: `4px solid ${m.read ? 'var(--border)' : 'var(--accent)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{m.from}</strong>
                <span style={{ color: 'var(--text-secondary)' }}>{m.when}</span>
              </div>
              <div style={{ marginTop: 4 }}>{m.body}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <input className="input" placeholder="Type a message. Use @mentions" value={input} onChange={e => setInput(e.target.value)} />
          <button className="btn primary" onClick={send}>Send</button>
        </div>
      </div>
      <div className="card" style={{ padding: 16, marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Email Integration</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Two-way sync is visualized here. CC/BCC rules per client type are applied automatically.</p>
        <div className="status-badge info">Connected to: admin@mpsone.co.id</div>
      </div>
    </div>
  );
}