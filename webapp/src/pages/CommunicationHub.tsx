import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { apiListUsers, apiUploadDoc, apiAppendThreadMessage, apiCreateThread, apiIsConversationBlocked } from '../services/api';
import { useSearchParams } from 'react-router-dom';
import { useModule } from '../components/useModule';
import { useI18n } from '../components/I18nProvider';
import { uniqueId } from '../components/utils/uniqueId';
import { apiListThreads } from '../services/api';
import { getOfflineMode } from '../config';
import * as mock from '../services/mock';
import { enqueue, subscribe, initQueueAutoFlush } from '../services/offlineQueue';

type Message = { id: string; from: string; body: string; status: 'sent'|'delivered'|'read'; when: string; attachments?: { name: string, size: number }[] };
type AttachmentMeta = { name: string; size: number; url?: string; doc_id?: number };

// Memoized message item to reduce re-renders of the conversation list
const MessageItem = React.memo(function MessageItem({ message, t }: { message: Message; t: any }) {
  return (
    <div role="listitem" className="card" style={{ padding: 12, borderLeft: `4px solid ${message.status === 'read' ? 'var(--border)' : 'var(--accent)'}`, transition: 'transform .2s ease, box-shadow .2s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div aria-hidden="true" style={{ width: 24, height: 24, borderRadius: 12, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: 12 }}>
            {(message.from || '?').slice(0,1)}
          </div>
          <strong>{message.from}</strong>
        </div>
        <span style={{ color: 'var(--text-secondary)' }}>{message.when}</span>
      </div>
      <div className="message-body" style={{ marginTop: 8, padding: 10, borderRadius: 8, background: message.from === 'You' ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)' }} dangerouslySetInnerHTML={{ __html: message.body }} />
      {message.attachments && message.attachments.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t('comms.attachments')}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
            {message.attachments.map((a: any) => (
              a.url ? (
                <a key={a.name} href={a.url} target="_blank" rel="noopener noreferrer" className="status-badge info" title={`${a.name} • ${(a.size/1024).toFixed(1)} KB`}>
                  {a.name}
                </a>
              ) : (
                <span key={a.name} className="status-badge info" title={`${a.name} • ${(a.size/1024).toFixed(1)} KB`}>{a.name}</span>
              )
            ))}
          </div>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <span className={`status-badge ${message.status === 'read' ? 'success' : message.status === 'delivered' ? 'warn' : 'info'}`}>
          {message.status === 'read' ? `✓✓ ${t('comms.status.read')}` : message.status === 'delivered' ? `✓ ${t('comms.status.delivered')}` : t('comms.status.sent')}
        </span>
      </div>
    </div>
  );
});

export default function CommunicationHub() {
  useModule('procurement');
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const [liveText, setLiveText] = useState('');
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [thread, setThread] = useState<Message[]>([]);
  const [threadId, setThreadId] = useState<number | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [blocked, setBlocked] = useState<boolean>(false);
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [subject, setSubject] = useState('');
  const [cc, setCc] = useState<string[]>([]);
  const [bcc, setBcc] = useState<string[]>([]);
  const [ccInput, setCcInput] = useState('');
  const [bccInput, setBccInput] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const textareaRef = inputRef;
  const [labels, setLabels] = useState<string[]>(['general']);
  const [archived, setArchived] = useState<boolean>(false);
  const [revealArchived, setRevealArchived] = useState<boolean>(false);
  const [queuePending, setQueuePending] = useState<number>(0);

  const unread = useMemo(() => thread.filter(t => t.status !== 'read').length, [thread]);

  // Load threads by context (PR/PO)
  useEffect(() => {
    const prId = searchParams.get('prId');
    const poId = searchParams.get('poId');
    async function load() {
      try {
        const data = await apiListThreads({ pr_id: prId ? Number(prId) : undefined, po_id: poId ? Number(poId) : undefined });
        const rows = Array.isArray(data.rows) ? data.rows : [];
        // Use the most recent thread for this context if available
        if (rows.length > 0) {
          const row = rows[0];
          setThreadId(row.id);
          if (row.subject) setSubject(String(row.subject));
          setParticipants(Array.isArray(row.participants) ? row.participants : (row.participants_json || []));
          let msgs: any[] = [];
          try { msgs = Array.isArray(row.messages_json) ? row.messages_json : JSON.parse(row.messages_json || '[]'); } catch {}
          const mapped: Message[] = msgs.map((m: any) => ({
            id: uniqueId('msg'),
            from: m.author || m.from || 'Unknown',
            body: m.body || m.text || '',
            status: (m.status || 'read') as Message['status'],
            when: m.when || new Date().toLocaleTimeString(),
            attachments: m.attachments || [],
          }));
          setThread(mapped);
          // Load meta (labels/archive) from localStorage for client-side feature
          const metaKey = row?.id != null ? `thread_meta_${row.id}` : null;
          if (metaKey) {
            try {
              const raw = localStorage.getItem(metaKey);
              if (raw) {
                const meta = JSON.parse(raw);
                if (Array.isArray(meta?.labels)) setLabels(meta.labels);
                if (typeof meta?.archived === 'boolean') setArchived(meta.archived);
              }
            } catch {}
          }
          try {
            const res = await apiIsConversationBlocked(Array.isArray(row.participants) ? row.participants : (row.participants_json || []));
            setBlocked(!!res?.blocked);
          } catch {}
        } else {
          setThread([]);
          setThreadId(null);
          setParticipants([]);
          setBlocked(false);
        }
      } catch (err) {
        console.error('Load threads failed', err);
      }
    }
    load();
  }, [searchParams]);

  // Queue auto-flush and status subscription
  useEffect(() => {
    initQueueAutoFlush();
    const unsub = subscribe(({ pending }) => setQueuePending(pending));
    return () => { unsub(); };
  }, []);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = Array.from(e.target.files ?? []);
    setFiles(prev => [...prev, ...f]);
    setProgress(p => ({ ...p, ...Object.fromEntries(f.map(ff => [ff.name, 0])) }));
  }, []);

  // People suggestions for @mentions
  useEffect(() => {
    (async () => {
      try { const res = await apiListUsers(); setUsers(Array.isArray(res.rows) ? res.rows : []); } catch {}
    })();
  }, []);

  const applyFormat = useCallback((tag: 'bold'|'italic'|'underline'|'link') => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    let before = input.slice(0, start);
    let sel = input.slice(start, end);
    let after = input.slice(end);
    if (tag === 'bold') sel = `**${sel || 'text'}**`;
    else if (tag === 'italic') sel = `*${sel || 'text'}*`;
    else if (tag === 'underline') sel = `<u>${sel || 'text'}</u>`;
    else if (tag === 'link') sel = `[${sel || 'link'}](https://)`;
    const next = before + sel + after;
    setInput(next);
    setTimeout(() => { el.focus(); el.selectionStart = before.length; el.selectionEnd = before.length + sel.length; }, 0);
  }, [input]);

  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); }, []);
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = Array.from(e.dataTransfer.files || []);
    if (f.length) {
      setFiles(prev => [...prev, ...f]);
      setProgress(p => ({ ...p, ...Object.fromEntries(f.map(ff => [ff.name, 0])) }));
    }
  }, []);

  const fileHash = useCallback(async (f: File): Promise<string | undefined> => {
    try {
      const buf = await f.arrayBuffer();
      const hash = await crypto.subtle.digest('SHA-256', buf);
      const bytes = Array.from(new Uint8Array(hash));
      return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch { return undefined; }
  }, []);

  const sendRef = useRef<() => void>(() => {});
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'enter') { e.preventDefault(); sendRef.current(); return; }
    if (e.key === 'Escape') { setShowMentions(false); return; }
    const value = (e.currentTarget.value || '');
    const cursor = e.currentTarget.selectionStart ?? value.length;
    const upto = value.slice(0, cursor);
    const m = upto.match(/@([\w\.-]+)$/);
    if (m) { setMentionQuery(m[1].toLowerCase()); setShowMentions(true); } else { setShowMentions(false); }
  }, []);

  // Minimal markdown-safe HTML serialization
  function toHTML(text: string): string {
    let esc = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    // bold **text**
    esc = esc.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // italic *text*
    esc = esc.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // underline <u>text</u> (already escaped, allow explicit tag via marker in applyFormat)
    esc = esc.replace(/&lt;u&gt;(.*?)&lt;\/u&gt;/g, '<u>$1</u>');
    // links [text](url)
    esc = esc.replace(/\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    // mentions @email
    esc = esc.replace(/(^|\s)@([\w.\-]+@[\w.\-]+)/g, '$1<span class="mention">@$2</span>');
    // newlines
    esc = esc.replace(/\n/g, '<br/>');
    return esc;
  }

  const saveMeta = useCallback((id: number | null, data: { labels?: string[]; archived?: boolean }) => {
    if (id == null) return;
    const key = `thread_meta_${id}`;
    const current = (() => { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : {}; } catch { return {}; } })();
    const next = { ...current, ...data };
    try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
  }, []);

  const send = useCallback(async () => {
    if (blocked) return;
    if (!input.trim() && files.length === 0) return;
    const now = new Date().toLocaleTimeString();
    const attachments: AttachmentMeta[] = files.map(f => ({ name: f.name, size: f.size }));
    const newMsg: Message = { id: uniqueId('msg'), from: 'You', body: toHTML(input), status: 'sent', when: now, attachments };
    setThread(t => [...t, newMsg]);
    setInput('');
    setSubject('');
    setLiveText(t('action.sending') || 'Sending message');
    inputRef.current?.focus();
    const effectivelyOffline = getOfflineMode() || !navigator.onLine;
    // Backend send/append for context or enqueue when offline
    try {
      const role = localStorage.getItem('mpsone_role') || 'PIC_Operational';
      // Map to backend message format
      const backendMsg = { author: 'You', body_html: newMsg.body, attachments: newMsg.attachments, when: new Date().toISOString(), status: 'sent' };
      const prId = searchParams.get('prId');
      const poId = searchParams.get('poId');
      if (threadId != null) {
        if (effectivelyOffline) {
          // Optimistic local append and enqueue for reconciliation
          await mock.apiAppendThreadMessage(threadId, backendMsg, role);
          enqueue({ type: 'appendMessage', payload: { threadId, message: backendMsg, role } });
        } else {
          await apiAppendThreadMessage(threadId, backendMsg, role);
        }
      } else {
        const meEmail = localStorage.getItem('mpsone_user_email') || 'you@local';
        const newParticipants = [
          { email: meEmail, role },
          { email: 'procurement@mpsone.co.id', role: 'PIC_Procurement' },
        ];
        // Include CC recipients as participants for visibility like Gmail
        for (const email of cc) newParticipants.push({ email, role: 'CC' });
        const created = effectivelyOffline
          ? await mock.apiCreateThread({ subject, participants: newParticipants, messages: [backendMsg], ...(prId ? { pr_id: Number(prId) } : {}), ...(poId ? { po_id: Number(poId) } : {}) }, role)
          : await apiCreateThread({ subject, participants: newParticipants, messages: [backendMsg], ...(prId ? { pr_id: Number(prId) } : {}), ...(poId ? { po_id: Number(poId) } : {}) }, role);
        if (created?.id) setThreadId(created.id);
        setParticipants(newParticipants);
        setCc([]);
        setBcc([]);
        setCcInput('');
        setBccInput('');
        try {
          const res = await apiIsConversationBlocked(newParticipants);
          setBlocked(!!res?.blocked);
        } catch {}
      }
    } catch (err) {
      console.error('Send/append failed', err);
    }
    // Upload attachments and simulate progress
    if (files.length) {
      const names = files.map(f => f.name);
      // Start uploads (metadata-based) and mark doc_id/url on attachments
      (async () => {
        for (const f of files) {
          const url = URL.createObjectURL(f);
          const hash = await fileHash(f);
          try {
            if (effectivelyOffline) {
              // Persist locally for immediate UI and enqueue reconciliation
              const resLocal = await mock.apiUploadDoc({ type: 'EmailAttachment', refId: threadId, url, hash_sha256: hash });
              enqueue({ type: 'uploadDoc', payload: { type: 'EmailAttachment', refId: threadId, url, hash_sha256: hash } });
              setThread(t => t.map(m => m.id === newMsg.id ? {
                ...m,
                attachments: (m.attachments || []).map((a: any) => a.name === f.name ? { ...a, url, doc_id: resLocal?.id } : a)
              } : m));
            } else {
              const res = await apiUploadDoc({ type: 'EmailAttachment', refId: threadId, url, hash_sha256: hash });
              setThread(t => t.map(m => m.id === newMsg.id ? {
                ...m,
                attachments: (m.attachments || []).map((a: any) => a.name === f.name ? { ...a, url, doc_id: res?.id } : a)
              } : m));
            }
          } catch (err) {
            console.error('Upload doc failed', err);
          }
        }
      })();
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
            setLiveText(t('comms.status.delivered'));
            setTimeout(() => setLiveText(t('comms.status.read')), 1200);
          }
          return next;
        });
      }, 300);
    } else {
      // no attachments: still simulate receipt
      setTimeout(() => setThread(t => t.map(m => m.id === newMsg.id ? { ...m, status: 'delivered' } : m)), 300);
      setTimeout(() => setThread(t => t.map(m => m.id === newMsg.id ? { ...m, status: 'read' } : m)), 1200);
      setLiveText(t('comms.status.delivered'));
      setTimeout(() => setLiveText(t('comms.status.read')), 900);
    }
  }, [blocked, input, files, t, searchParams, threadId, cc, bcc]);

  useEffect(() => { sendRef.current = send; }, [send]);

  return (
    <div className="main">
      <div className="page-header procurement">
        <h1 style={{ margin: 0 }}>{t('comms.title')}</h1>
      </div>
      <div className="card" style={{ padding: 16 }}>
        {queuePending > 0 && (
          <div className="status-badge warn" role="status" aria-live="polite" style={{ marginBottom: 8 }}>
            {t('comms.sync_pending') ? t('comms.sync_pending').replace('{n}', String(queuePending)) : `Sync pending: ${queuePending}`}
          </div>
        )}
        {blocked && (
          <div className="status-badge warn" role="alert" aria-live="polite" style={{ marginBottom: 8 }}>
            {t('comms.blocked_banner')}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ marginTop: 0 }}>{t('comms.threads')}</h2>
          <div className="status-badge info">{t('comms.unread').replace('{n}', String(unread))}</div>
        </div>
        {/* Labels & Archive toggles */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t('comms.labels') || 'Labels'}:</span>
          {labels.map(l => (
            <span key={l} className="status-badge info" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {l}
              <button type="button" className="btn ghost" aria-label={`Remove ${l}`} onClick={() => { const next = labels.filter(x => x !== l); setLabels(next); saveMeta(threadId, { labels: next }); }} style={{ padding: '0 4px' }}>×</button>
            </span>
          ))}
          <input className="input" placeholder="add label" style={{ width: 160 }} onKeyDown={e => {
            if (e.key === 'Enter') { const v = (e.currentTarget.value || '').trim(); if (v) { const next = Array.from(new Set([...labels, v])); setLabels(next); saveMeta(threadId, { labels: next }); e.currentTarget.value = ''; } }
          }} />
          <label style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={archived} onChange={e => { setArchived(e.target.checked); saveMeta(threadId, { archived: e.target.checked }); }} />
            <span style={{ fontSize: 12 }}>{t('comms.archive') || 'Archive'}</span>
          </label>
        </div>
        {/* Gmail-like recipients line */}
        <div aria-label={t('comms.to')} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: 28 }}>{t('comms.to')}:</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(participants && participants.length > 0 ? participants : [{ email: 'procurement@mpsone.co.id', role: 'PIC_Procurement' }]).map((p: any) => (
              <span key={p.email || p.name || String(p)} className="status-badge info" title={p.role ? `${p.email} • ${p.role}` : (p.email || p.name || String(p))}>
                {p.email || p.name || String(p)}
              </span>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
            <button type="button" className="btn ghost" onClick={() => setShowCc(s => !s)} aria-pressed={showCc} style={{ padding: '4px 8px' }}>{t('comms.cc')}</button>
            <button type="button" className="btn ghost" onClick={() => setShowBcc(s => !s)} aria-pressed={showBcc} style={{ padding: '4px 8px' }}>{t('comms.bcc')}</button>
          </div>
        </div>
        {showCc && (
          <div aria-label={t('comms.cc')} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: 28 }}>{t('comms.cc')}:</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {cc.map(email => (
                <span key={email} className="status-badge info" title={email}>
                  {email}
                  <button type="button" className="btn ghost" aria-label={`Remove ${email}`} onClick={() => setCc(list => list.filter(e => e !== email))} style={{ marginLeft: 6, padding: '0 4px' }}>×</button>
                </span>
              ))}
            </div>
            <input
              className="input"
              placeholder="email@domain"
              value={ccInput}
              onChange={e => setCcInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const v = ccInput.trim();
                  if (v && /.+@.+\..+/.test(v)) setCc(list => Array.from(new Set([...list, v])));
                  setCcInput('');
                }
              }}
              style={{ flex: '1 1 auto', minWidth: 0 }}
            />
          </div>
        )}
        {showBcc && (
          <div aria-label={t('comms.bcc')} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: 28 }}>{t('comms.bcc')}:</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {bcc.map(email => (
                <span key={email} className="status-badge info" title={email}>
                  {email}
                  <button type="button" className="btn ghost" aria-label={`Remove ${email}`} onClick={() => setBcc(list => list.filter(e => e !== email))} style={{ marginLeft: 6, padding: '0 4px' }}>×</button>
                </span>
              ))}
            </div>
            <input
              className="input"
              placeholder="email@domain"
              value={bccInput}
              onChange={e => setBccInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const v = bccInput.trim();
                  if (v && /.+@.+\..+/.test(v)) setBcc(list => Array.from(new Set([...list, v])));
                  setBccInput('');
                }
              }}
              style={{ flex: '1 1 auto', minWidth: 0 }}
            />
          </div>
        )}
        {/* Subject line like Gmail */}
        <div aria-label={t('comms.subject')} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: 56 }}>{t('comms.subject')}:</span>
          <input
            className="input"
            placeholder={t('comms.subject')}
            value={subject}
            onChange={e => setSubject(e.target.value)}
            disabled={blocked}
            style={{ flex: '1 1 auto', minWidth: 0 }}
          />
        </div>
        <div aria-live="polite" style={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }}>{liveText}</div>
        {/* Archived threads hidden by default */}
        {archived && !revealArchived ? (
          <div className="card" role="alert" style={{ padding: 12, marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{t('comms.archived_hidden') || 'This thread is archived and hidden.'}</span>
              <button type="button" className="btn ghost" onClick={() => setRevealArchived(true)}>{t('comms.show_archived') || 'Show'}</button>
            </div>
          </div>
        ) : null}
        <div role="list" aria-label="Conversation" style={{ display: archived && !revealArchived ? 'none' : 'grid', gap: 8, marginTop: 12 }}>
          {thread.map(m => (
            <MessageItem key={m.id} message={m} t={t} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, marginTop: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {/* Formatting toolbar */}
            <div role="toolbar" aria-label="Formatting" style={{ display: 'flex', gap: 6 }}>
              <button type="button" className="btn ghost" onClick={() => applyFormat('bold')} title="Bold">B</button>
              <button type="button" className="btn ghost" onClick={() => applyFormat('italic')} title="Italic"><i>I</i></button>
              <button type="button" className="btn ghost" onClick={() => applyFormat('underline')} title="Underline"><u>U</u></button>
              <button type="button" className="btn ghost" onClick={() => applyFormat('link')} title="Link">🔗</button>
            </div>
            {/* Pre-send attachments chips */}
            {files.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {files.map(f => (
                  <span key={f.name} className="status-badge info" title={`${f.name} • ${(f.size/1024).toFixed(1)} KB`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    {f.name}
                    <button type="button" className="btn ghost" aria-label={`Remove ${f.name}`} onClick={() => {
                      setFiles(list => list.filter(x => x.name !== f.name));
                      setProgress(p => { const n = { ...p }; delete n[f.name]; return n; });
                    }} style={{ padding: '0 4px' }}>×</button>
                  </span>
                ))}
              </div>
            )}
            {/* Compose area with drag-drop */}
            <div onDragOver={onDragOver} onDrop={onDrop} style={{ display: 'flex', gap: 8 }}>
            <textarea
              ref={inputRef}
              className="input"
              placeholder={t('comms.input_placeholder')}
              aria-label={t('comms.input_placeholder')}
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={blocked}
              rows={3}
              onKeyDown={handleKeyDown}
              style={{ flex: '1 1 auto', minWidth: 0, resize: 'vertical' }}
            />
            <label className="btn" aria-label={t('comms.add_attachments')} style={{ cursor: blocked ? 'not-allowed' : 'pointer', opacity: blocked ? 0.6 : 1, pointerEvents: blocked ? 'none' : 'auto' }} aria-disabled={blocked}>
              {t('comms.add_attachments')}
              <input type="file" multiple onChange={onFileChange} style={{ display: 'none' }} />
            </label>
            </div>
            {/* Mentions suggestions */}
            {showMentions && (
              <div role="listbox" aria-label="Mentions" className="card" style={{ padding: 8 }}>
                {(users || []).filter(u => String(u.email || '').toLowerCase().includes(mentionQuery)).slice(0,6).map(u => (
                  <button key={u.email} type="button" className="btn ghost" onClick={() => {
                    const el = inputRef.current; if (!el) return;
                    const start = el.selectionStart ?? input.length; const before = input.slice(0, start);
                    const m = before.match(/@([\w\.-]+)$/); const prefixLen = m ? m[1].length : 0;
                    const newBefore = prefixLen ? before.slice(0, before.length - prefixLen) : before;
                    const next = `${newBefore}${u.email}${input.slice(start)}`;
                    setInput(next); setShowMentions(false);
                  }} style={{ marginRight: 6 }}>{u.name || u.email}</button>
                ))}
              </div>
            )}
          </div>
          <button className="btn primary" aria-label={t('action.send') || 'Send'} onClick={send} aria-busy={files.length > 0 && Object.values(progress).some(p => p < 100)} disabled={blocked}>{t('action.send') || 'Send'}</button>
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
                  <div className="progress-bar">
                    <div className="value" style={{ width: `${Math.min(100, progress[f.name] ?? 0)}%` }}></div>
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
 
