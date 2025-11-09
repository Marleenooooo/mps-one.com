import React from 'react';
import { useModule } from '../../components/useModule';
import { DataTable } from '../../components/UI/DataTable';
import { useI18n } from '../../components/I18nProvider';
import { createInvite, listInvites, revokeInvite, Invite } from '../../components/utils/fakeApi';

const recentActivity = [
  { id: 1, user: 'PIC Procurement - Sari', type: 'created_quote', idRef: 'Q-1209', prRef: 'PR-443', time: '2h' },
  { id: 2, user: 'PIC Finance - Damar', type: 'approved_po', poRef: 'PO-9821', time: '5h' },
  { id: 3, user: 'Admin - Rudi', type: 'updated_budget', dept: 'Dept Mining Ops', time: '1d' },
];

const metrics = [
  { label: 'Pending Quotes', value: 12 },
  { label: 'Active POs', value: 8 },
  { label: 'Unpaid Invoices', value: 5 },
];

const clients = [
  { id: 'KAL-001', company: 'Kalimantan Mining Group', status: 'Active', lastContact: 'Today' },
  { id: 'BOR-225', company: 'Borneo Minerals Co', status: 'Pending Quote', lastContact: 'Yesterday' },
  { id: 'SAM-310', company: 'Samarinda Mining', status: 'Active', lastContact: '3d' },
];

export default function AdminDashboard() {
  useModule('reports');
  const { t } = useI18n();
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteRole, setInviteRole] = React.useState<'PIC Operational' | 'PIC Procurement' | 'PIC Finance'>('PIC Procurement');
  const [inviteDept, setInviteDept] = React.useState('');
  const [generatedCode, setGeneratedCode] = React.useState<string | null>(null);
  const [expiresAt, setExpiresAt] = React.useState<string | null>(null);
  const [copyMsg, setCopyMsg] = React.useState('');
  const [invites, setInvites] = React.useState<Invite[]>([]);
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'revoked' | 'expired'>('all');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(5);

  async function refreshInvites() {
    const list = await listInvites();
    setInvites(list);
  }
  React.useEffect(() => { refreshInvites(); }, []);

  async function generateCode() {
    const res = await createInvite({ email: inviteEmail.trim(), role: inviteRole, department: inviteDept.trim() || undefined });
    setGeneratedCode(res.code);
    setExpiresAt(res.expiresAt);
    setCopyMsg('');
    await refreshInvites();
  }
  async function copyCode() {
    if (!generatedCode) return;
    try { await navigator.clipboard.writeText(generatedCode); setCopyMsg(t('clipboard.copied') || 'Copied'); } catch { setCopyMsg(''); }
  }

  function derivedStatus(inv: Invite): 'active' | 'revoked' | 'expired' {
    if (inv.status === 'revoked') return 'revoked';
    const expired = new Date(inv.expiresAt).getTime() < Date.now();
    return expired ? 'expired' : 'active';
  }

  const filteredInvites = invites.filter(inv => statusFilter === 'all' ? true : derivedStatus(inv) === statusFilter);
  const totalPages = Math.max(1, Math.ceil(filteredInvites.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const pageInvites = filteredInvites.slice(startIdx, startIdx + pageSize);

  function copyInviteCode(code: string) {
    try { navigator.clipboard.writeText(code); } catch { /* noop */ }
  }

  function activityText(a: any) {
    switch (a.type) {
      case 'created_quote':
        return t('activity.created_quote').replace('{id}', a.idRef).replace('{pr}', a.prRef);
      case 'approved_po':
        return t('activity.approved_po').replace('{po}', a.poRef);
      case 'updated_budget':
        return t('activity.updated_budget').replace('{dept}', a.dept);
      default:
        return '';
    }
  }

  function formatAgo(token: string) {
    if (token.endsWith('h')) {
      const n = token.replace('h','');
      return t('time.hours_ago').replace('{n}', n);
    }
    if (token.endsWith('d')) {
      const n = token.replace('d','');
      return t('time.days_ago').replace('{n}', n);
    }
    return token;
  }
  return (
    <div className="main" role="main">
      <div className="page-header reports">
        <h1 style={{ margin: 0 }}>{t('admin.title')}</h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[{ label: t('admin.metrics.pending_quotes'), value: 12 }, { label: t('admin.metrics.active_pos'), value: 8 }, { label: t('admin.metrics.unpaid_invoices'), value: 5 }].map(m => (
          <div key={m.label} className="card" style={{ padding: 16 }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{m.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{m.value}</div>
            <div className="status-badge info">{t('admin.updated_hint')}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginTop: 16 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>{t('admin.comm_center')}</h2>
            <button className="btn" aria-label={t('admin.compose_email')}>{t('admin.compose_email')}</button>
          </div>
          <DataTable
            data={clients}
            columns={[
              { key: 'id', header: t('datatable.client_id') },
              { key: 'company', header: t('datatable.company') },
              { key: 'status', header: t('datatable.status'), render: v => <span className="status-badge info">{t('status.' + String(v).toLowerCase().replace(/\s+/g, '_'))}</span> },
              { key: 'lastContact', header: t('datatable.last_contact'), render: v => {
                if (v === 'Today') return t('time.today');
                if (v === 'Yesterday') return t('time.yesterday');
                return formatAgo(String(v));
              } },
            ]}
          />
        </div>
        <div className="card" style={{ padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>{t('admin.recent_activity')}</h2>
          <ul aria-label="Recent activity" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {recentActivity.map(a => (
              <li key={a.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600 }}>{a.user}</div>
                <div style={{ color: 'var(--text-secondary)' }}>{activityText(a)}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{formatAgo(String(a.time))}</div>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button className="btn" aria-label={t('admin.new_pr')}>{t('admin.new_pr')}</button>
            <button className="btn" aria-label={t('admin.new_quote')}>{t('admin.new_quote')}</button>
            <button className="btn" aria-label={t('admin.new_po')}>{t('admin.new_po')}</button>
          </div>
        </div>
      </div>

      {/* Invite User panel mock */}
      <div className="card" style={{ padding: 16, marginTop: 16 }} aria-label="Invite User">
        <h2 style={{ marginTop: 0 }}>{t('admin.invite_user') || 'Invite User'}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8 }}>
          <label>
            <div style={{ fontWeight: 600 }}>{t('auth.email')}</div>
            <input className="input" type="email" placeholder="user@company.co.id" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
          </label>
          <label>
            <div style={{ fontWeight: 600 }}>{t('auth.role')}</div>
            <select className="select" value={inviteRole} onChange={e => setInviteRole(e.target.value as any)}>
              <option value="PIC Operational">PIC Operational</option>
              <option value="PIC Procurement">PIC Procurement</option>
              <option value="PIC Finance">PIC Finance</option>
            </select>
          </label>
          <label>
            <div style={{ fontWeight: 600 }}>{t('department.name') || 'Department'}</div>
            <input className="input" type="text" placeholder="e.g. Procurement" value={inviteDept} onChange={e => setInviteDept(e.target.value)} />
          </label>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn" onClick={generateCode} aria-label="Generate Code" style={{
              background: 'linear-gradient(135deg, #00F0FF 0%, #0077FF 100%)', boxShadow: '0 0 10px #00F0FF'
            }}>Generate</button>
          </div>
        </div>
        {generatedCode && (
          <div className="status-badge success" style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }} aria-live="polite">
            <span>Code:</span>
            <code style={{ fontWeight: 700 }}>{generatedCode}</code>
            <button className="btn ghost" onClick={copyCode} aria-label="Copy code">Copy</button>
            <span style={{ color: 'var(--text-secondary)' }}>{copyMsg}</span>
            {expiresAt && (
              <span style={{ marginLeft: 12, color: 'var(--text-secondary)' }}>Expires: {new Date(expiresAt).toLocaleString()}</span>
            )}
          </div>
        )}
        <div style={{ marginTop: 8, color: 'var(--text-secondary)', fontSize: 12 }}>
          This is a mock. In production, codes are created via API with expiry and single-use.
        </div>
      </div>

      {/* Manage Invites */}
      <div className="card" style={{ padding: 16, marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>{t('admin.invites.title') || 'Manage Invites'}</h2>
        {invites.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)' }}>{t('admin.invites.none') || 'No invites yet.'}</div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 600 }}>{t('admin.invites.filter_label') || 'Filter'}</span>
              <select className="select" aria-label={t('admin.invites.filter_label') || 'Filter'} value={statusFilter} onChange={e => { setStatusFilter(e.target.value as any); setPage(1); }}>
                <option value="all">{t('admin.invites.status_all') || 'All'}</option>
                <option value="active">{t('status.active') || 'Active'}</option>
                <option value="expired">{t('status.expired') || 'Expired'}</option>
                <option value="revoked">{t('status.revoked') || 'Revoked'}</option>
              </select>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 600 }}>{t('datatable.page_size') || 'Page size'}</span>
              <select className="select" aria-label={t('datatable.page_size') || 'Page size'} value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </label>
            <div aria-live="polite" style={{ marginLeft: 'auto', color: 'var(--text-secondary)' }}>
              {t('datatable.page') || 'Page'} {currentPage} / {totalPages}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn ghost" onClick={() => setPage(p => Math.max(1, p - 1))} aria-label="Previous page" disabled={currentPage <= 1}>‹</button>
              <button className="btn ghost" onClick={() => setPage(p => Math.min(totalPages, p + 1))} aria-label="Next page" disabled={currentPage >= totalPages}>›</button>
            </div>
          </div>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Email</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>{t('auth.role')}</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>{t('form.department')}</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>{t('admin.invites.code') || 'Code'}</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>{t('admin.invites.expires_at') || 'Expires At'}</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>{t('admin.invites.status') || 'Status'}</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {pageInvites.map(inv => (
                <tr key={inv.id}>
                  <td style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>{inv.email}</td>
                  <td style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>{inv.role}</td>
                  <td style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>{inv.department ?? '-'}</td>
                  <td style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <code>{inv.code}</code>
                    <button className="btn ghost" onClick={() => copyInviteCode(inv.code)} aria-label={t('admin.invites.copy_code') || 'Copy code'}>{t('actions.copy') || 'Copy'}</button>
                  </td>
                  <td style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>{new Date(inv.expiresAt).toLocaleString()}</td>
                  <td style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span className="status-badge info">{derivedStatus(inv)}</span>
                  </td>
                  <td style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    {derivedStatus(inv) === 'active' ? (
                      <button className="btn ghost" onClick={async () => { await revokeInvite(inv.id); await refreshInvites(); }} aria-label={t('admin.invites.revoke') || 'Revoke'}>
                        {t('admin.invites.revoke') || 'Revoke'}
                      </button>
                    ) : (
                      <span style={{ color: 'var(--text-disabled)' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
