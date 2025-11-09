import React, { useEffect, useMemo, useState } from 'react';
import { useModule } from '../../components/useModule';
import { useI18n } from '../../components/I18nProvider';
import { uniqueId } from '../../components/utils/uniqueId';

type Template = { id: string; name: string; subject: string; updated: string };
type Rule = { id: number; clientType: string; cc: string[]; bcc: string[]; enabled: boolean };
type Message = { id: string; from: string; to: string[]; cc: string[]; bcc: string[]; time: string; body: string; status: 'sent'|'delivered'|'read' };
type Thread = { id: string; subject: string; participants: string[]; unread: number; messages: Message[] };

export default function EmailDashboard() {
  useModule('procurement');
  const { t } = useI18n();
  const [mounting, setMounting] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([
    { id: 'tpl-1', name: 'Quote - Standard', subject: 'Quotation for {company}', updated: '2025-08-20' },
    { id: 'tpl-2', name: 'PO Confirmation', subject: 'PO #{po} Confirmation', updated: '2025-08-18' },
  ]);
  const [rules, setRules] = useState<Rule[]>([
    { id: 1, clientType: 'Enterprise', cc: ['ops@client.co.id'], bcc: ['finance@client.co.id'], enabled: true },
    { id: 2, clientType: 'SME', cc: [], bcc: ['audit@mpsone.co.id'], enabled: false },
  ]);
  const [threads, setThreads] = useState<Thread[]>([
    {
      id: 't-9821',
      subject: 'PO #9821 Confirmation',
      participants: ['procurement@mpsone.co.id','client.procurement@kalmining.co.id'],
      unread: 2,
      messages: [
        { id: 'm1', from: 'procurement@mpsone.co.id', to: ['client.procurement@kalmining.co.id'], cc: ['ops@client.co.id'], bcc: [], time: '09:10', body: 'Dear team, please confirm PO #9821.', status: 'sent' },
        { id: 'm2', from: 'client.procurement@kalmining.co.id', to: ['procurement@mpsone.co.id'], cc: [], bcc: [], time: '09:25', body: 'PO confirmed. Expected ship tomorrow.', status: 'delivered' },
        { id: 'm3', from: 'procurement@mpsone.co.id', to: ['client.procurement@kalmining.co.id'], cc: ['finance@client.co.id'], bcc: ['audit@mpsone.co.id'], time: '09:40', body: 'Finance notified, invoice to follow.', status: 'read' },
      ],
    },
    {
      id: 't-quote-1209',
      subject: 'Quotation Q-1209 for PR-443',
      participants: ['sales@mpsone.co.id','ops@client.co.id'],
      unread: 0,
      messages: [
        { id: 'm1', from: 'sales@mpsone.co.id', to: ['ops@client.co.id'], cc: [], bcc: [], time: 'Yesterday', body: 'Attached quotation Q-1209 for PR-443.', status: 'read' },
      ],
    },
  ]);
  const [selectedThreadId, setSelectedThreadId] = useState<string>('t-9821');
  useEffect(() => { const tm = setTimeout(() => setMounting(false), 400); return () => clearTimeout(tm); }, []);

  const connected = useMemo(() => ({ gmail: true, exchange: false }), []);

  function addTemplate() {
    const id = uniqueId('TPL');
    setTemplates(ts => [{ id, name: t('email.new_template'), subject: 'Subject...', updated: new Date().toISOString().slice(0,10) }, ...ts]);
  }
  function removeTemplate(id: string) {
    setTemplates(ts => ts.filter(t => t.id !== id));
  }
  function toggleRule(id: number) {
    setRules(rs => rs.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  }

  return (
    <div className="main">
      <div className="page-header procurement" style={{ borderImage: 'linear-gradient(90deg, #0A1F4D, #0A0F2D) 1' }}>
        <h1 style={{ margin: 0 }}>{t('email.title')}</h1>
      </div>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>{t('email.sync_status')}</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className={`status-badge ${connected.gmail ? 'info' : ''}`}>Gmail {connected.gmail ? t('email.connected') : t('email.disconnected')}</span>
            <span className={`status-badge ${connected.exchange ? 'info' : ''}`}>Exchange {connected.exchange ? t('email.connected') : t('email.disconnected')}</span>
          </div>
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>{t('email.sync_desc')}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginTop: 16 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ marginTop: 0 }}>{t('email.templates')}</h2>
            <button className="btn" onClick={addTemplate}>{t('email.add_template')}</button>
          </div>
          {mounting ? (
            <div aria-busy="true" className="skeleton" style={{ height: 120, borderRadius: 8 }}></div>
          ) : (
            <div role="table" aria-label="Email templates" style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
              <div role="row" style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                {[t('email.name'), t('email.subject'), t('email.updated'), ''].map(h => (
                  <div role="columnheader" key={h} style={{ padding: 12, fontWeight: 600 }}>{h}</div>
                ))}
              </div>
              {templates.map(tpl => (
                <div key={tpl.id} role="row" style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr', borderBottom: '1px solid var(--border)' }}>
                  <div role="cell" style={{ padding: 8 }}>
                    <input className="input" value={tpl.name} onChange={e => setTemplates(ts => ts.map(t => t.id === tpl.id ? { ...t, name: e.target.value } : t))} />
                  </div>
                  <div role="cell" style={{ padding: 8 }}>
                    <input className="input" value={tpl.subject} onChange={e => setTemplates(ts => ts.map(t => t.id === tpl.id ? { ...t, subject: e.target.value } : t))} />
                  </div>
                  <div role="cell" style={{ padding: 8, alignSelf: 'center' }}>{tpl.updated}</div>
                  <div role="cell" style={{ padding: 8, display: 'flex', gap: 8 }}>
                    <button className="btn" onClick={() => removeTemplate(tpl.id)}>{t('action.remove')}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>{t('email.rules')}</h2>
          <div role="table" aria-label="CC/BCC Rules" style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
            <div role="row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
              {[t('email.client_type'), t('email.cc'), t('email.bcc'), t('email.enabled')].map(h => (
                <div role="columnheader" key={h} style={{ padding: 12, fontWeight: 600 }}>{h}</div>
              ))}
            </div>
            {rules.map(rule => (
              <div key={rule.id} role="row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', borderBottom: '1px solid var(--border)' }}>
                <div role="cell" style={{ padding: 8 }}>{rule.clientType}</div>
                <div role="cell" style={{ padding: 8 }}>
                  <input className="input" value={rule.cc.join(', ')} onChange={e => setRules(rs => rs.map(r => r.id === rule.id ? { ...r, cc: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } : r))} />
                </div>
                <div role="cell" style={{ padding: 8 }}>
                  <input className="input" value={rule.bcc.join(', ')} onChange={e => setRules(rs => rs.map(r => r.id === rule.id ? { ...r, bcc: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } : r))} />
                </div>
                <div role="cell" style={{ padding: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label className="btn" style={{ justifyContent: 'space-between' }}>
                    {t('email.toggle_enabled')}
                    <input type="checkbox" checked={rule.enabled} onChange={() => toggleRule(rule.id)} />
                  </label>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="btn primary" onClick={() => alert(t('action.export'))}>{t('email.save_rules')}</button>
          </div>
        </div>
      </div>
      <div className="card" style={{ padding: 16, marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>{t('comms.threads')}</h2>
          <div className="status-badge info">{t('comms.unread').replace('{n}', String(threads.reduce((a, th) => a + th.unread, 0)))}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 12, marginTop: 12 }}>
          <div role="navigation" aria-label="Thread list" style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
            {mounting ? (
              <div className="skeleton" style={{ height: 160 }}></div>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {threads.map(th => (
                  <li key={th.id}
                      role="button"
                      aria-label={th.subject}
                      onClick={() => setSelectedThreadId(th.id)}
                      style={{ padding: 12, borderBottom: '1px solid var(--border)', cursor: 'pointer', background: selectedThreadId===th.id? 'rgba(var(--module-color-rgb), 0.08)': 'transparent', transition: 'all 0.2s ease' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 600 }}>{th.subject}</div>
                      {th.unread > 0 && <span className="status-badge info">{t('comms.unread').replace('{n}', String(th.unread))}</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{th.participants.join(', ')}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div role="region" aria-label="Thread details" className="card" style={{ padding: 12 }}>
            {mounting ? (
              <div className="skeleton" style={{ height: 180, borderRadius: 8 }}></div>
            ) : (
              (() => {
                const th = threads.find(t => t.id === selectedThreadId);
                if (!th) return <div style={{ color: 'var(--text-secondary)' }}>No thread selected</div>;
                return (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0 }}>{th.subject}</h3>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t('comms.connected_to').replace('{email}', th.participants[0])}</div>
                    </div>
                    <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
                      {th.messages.map(m => (
                        <div key={m.id} className="card" style={{ padding: 8 }}>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{m.time}</div>
                          <div>{m.body}</div>
                          <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
                            <span className="status-badge info">{t('comms.status.' + m.status)}</span>
                            {m.cc.length > 0 && <span className="status-badge ghost">CC: {m.cc.join(', ')}</span>}
                            {m.bcc.length > 0 && <span className="status-badge ghost">BCC: {m.bcc.join(', ')}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <label className="input" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{t('comms.add_attachments')}</span>
                        <input type="file" multiple />
                      </label>
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button className="btn primary" onClick={() => alert('Send via email API')}>Send</button>
                        <button className="btn ghost" onClick={() => alert('Apply template')}>{t('email.templates')}</button>
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
