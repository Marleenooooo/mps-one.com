import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useModule } from '../../components/useModule';
import { useI18n } from '../../components/I18nProvider';
import { useToast } from '../../components/UI/Toast';
import { Breadcrumbs } from '../../components/Layout/Topbar';
import { useNavigate } from 'react-router-dom';

type Role = 'Admin' | 'PIC Operational' | 'PIC Procurement' | 'PIC Finance';

export default function Onboarding() {
  useModule('reports');
  const { t } = useI18n();
  const toast = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [company, setCompany] = useState('');
  const [domain, setDomain] = useState('');
  const [companyNpwp, setCompanyNpwp] = useState('');
  const [personalNpwp, setPersonalNpwp] = useState('');
  const [departments, setDepartments] = useState<string[]>(['Mining Ops']);
  const [roles, setRoles] = useState<Role[]>(['Admin']);
  const [budget, setBudget] = useState<number>(100000000);
  const [mounting, setMounting] = useState(true);
  const [savedFlash, setSavedFlash] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // Permission matrix per role
  const permissionKeys = useMemo(() => (
    ['perm.create_pr', 'perm.approve_po', 'perm.manage_budgets', 'perm.view_finance'] as const
  ), []);
  const [permissions, setPermissions] = useState<Record<Role, Record<(typeof permissionKeys)[number], boolean>>>({
    'Admin': { 'perm.create_pr': true, 'perm.approve_po': true, 'perm.manage_budgets': true, 'perm.view_finance': true },
    'PIC Operational': { 'perm.create_pr': true, 'perm.approve_po': false, 'perm.manage_budgets': false, 'perm.view_finance': false },
    'PIC Procurement': { 'perm.create_pr': true, 'perm.approve_po': true, 'perm.manage_budgets': false, 'perm.view_finance': false },
    'PIC Finance': { 'perm.create_pr': false, 'perm.approve_po': false, 'perm.manage_budgets': true, 'perm.view_finance': true },
  });

  // Department budget allocations
  const [deptAlloc, setDeptAlloc] = useState<Record<string, number>>({ 'Mining Ops': 60000000 });
  const totalAllocated = useMemo(() => Object.values(deptAlloc).reduce((a, b) => a + b, 0), [deptAlloc]);

  useEffect(() => { const tm = setTimeout(() => setMounting(false), 300); return () => clearTimeout(tm); }, []);

  const DRAFT_KEY = 'onboarding_draft_v1';
  // Autosave / load draft
  useEffect(() => {
    const raw = localStorage.getItem(DRAFT_KEY);
    const savedAtRaw = localStorage.getItem(DRAFT_KEY + ':lastSavedAt');
    if (raw) {
      try {
        const d = JSON.parse(raw);
        if (d.company) setCompany(d.company);
        if (d.domain) setDomain(d.domain);
        if (d.companyNpwp) setCompanyNpwp(d.companyNpwp);
        if (d.personalNpwp) setPersonalNpwp(d.personalNpwp);
        if (Array.isArray(d.departments)) setDepartments(d.departments);
        if (Array.isArray(d.roles)) setRoles(d.roles);
        if (typeof d.budget === 'number') setBudget(d.budget);
        if (d.deptAlloc && typeof d.deptAlloc === 'object') setDeptAlloc(d.deptAlloc);
        if (d.permissions && typeof d.permissions === 'object') setPermissions(d.permissions);
      } catch {}
    }
    // Prefill from signup data if present
    try {
      const signupCompany = localStorage.getItem('mpsone_company');
      const signupCompanyNpwp = localStorage.getItem('mpsone_company_npwp') || localStorage.getItem('mpsone_npwp');
      const signupPersonalNpwp = localStorage.getItem('mpsone_personal_npwp');
      if (signupCompany && !company) setCompany(signupCompany);
      if (signupCompanyNpwp && !companyNpwp) setCompanyNpwp(signupCompanyNpwp);
      if (signupPersonalNpwp && !personalNpwp) setPersonalNpwp(signupPersonalNpwp);
    } catch {}
    if (savedAtRaw) {
      try {
        const dt = new Date(savedAtRaw);
        if (!isNaN(dt.getTime())) setLastSavedAt(dt.toLocaleTimeString());
      } catch {}
    }
    // Mark hydration complete so the first autosave doesn't show a toast
    hydrated.current = true;
  }, []);
  // Debounced autosave + toast micro-interaction
  const saveTimer = useRef<number | null>(null);
  const hydrated = useRef(false);
  useEffect(() => {
    const data = { company, domain, companyNpwp, personalNpwp, departments, roles, budget, deptAlloc, permissions };
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
      if (hydrated.current) {
        // Inline saved badge instead of toast, micro-flash
        setSavedFlash(true);
        const now = new Date();
        setLastSavedAt(now.toLocaleTimeString());
        try { localStorage.setItem(DRAFT_KEY + ':lastSavedAt', now.toISOString()); } catch {}
        window.setTimeout(() => setSavedFlash(false), 2000);
        // Throttled toast still available globally if needed
        // toast.push({ type: 'info', tag: 'autosave', message: t('onb.autosaved') });
      }
    }, 60000);
    return () => { if (saveTimer.current) window.clearTimeout(saveTimer.current); };
  }, [company, domain, departments, roles, budget, deptAlloc, permissions, t, toast]);
  
  function renderBadge(label: string, value: string) {
    const digits = (value || '').replace(/[^0-9]/g, '');
    const is16 = digits.length === 16;
    const is15 = digits.length === 15;
    const type = is16 ? 'NPWP16' : (is15 ? 'NPWP' : 'NPWP');
    return (
      <div className="status-badge info" aria-label={`${label} ${type}`} title={`${label} ${type}`}>
        {value || '—'}
      </div>
    );
  }

  function next() { setStep(s => Math.min(4, s + 1)); }
  function prev() { setStep(s => Math.max(1, s - 1)); }

  return (
    <div className="main">
      <div className="page-header reports">
        <h1 style={{ margin: 0 }}>{t('onb.title')}</h1>
        <div style={{ marginTop: 8 }}>
          <Breadcrumbs items={[t('general.home'), t('nav.onboarding')]} />
        </div>
      </div>
      {mounting && <div className="skeleton" style={{ height: 100, borderRadius: 8 }}></div>}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div className={`status-badge ${step>=1?'info':''}`}>{t('onb.steps.company')}</div>
            <div className={`status-badge ${step>=2?'info':''}`}>{t('onb.steps.hierarchy')}</div>
            <div className={`status-badge ${step>=3?'info':''}`}>{t('onb.steps.roles')}</div>
            <div className={`status-badge ${step>=4?'info':''}`}>{t('onb.steps.budgets')}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {savedFlash && (
              <div className="status-badge info" aria-live="polite" style={{ transition: 'opacity .2s ease' }}>{t('onb.autosaved')}</div>
            )}
            {lastSavedAt && (
              <span aria-live="polite" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {t('form.last_saved').replace('{time}', lastSavedAt)}
              </span>
            )}
          </div>
        </div>

        {step === 1 && (
          <section aria-labelledby="company">
            <h2 id="company">{t('onb.company_registration')}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input className="input" placeholder={t('onb.company_name')} value={company} onChange={e => setCompany(e.target.value)} />
              <input className="input" placeholder={t('onb.domain')} value={domain} onChange={e => setDomain(e.target.value)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t('onb.company_id_label') || 'Company ID (Admin) = Company NPWP'}</label>
                {renderBadge('Company', companyNpwp)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t('onb.personal_npwp_label') || 'Admin Responsibility = Personal NPWP'}</label>
                {renderBadge('Personal', personalNpwp)}
              </div>
            </div>
            <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>
              {t('onb.company_identity_hint') || 'Admin provides 2 NPWPs: Company NPWP as account ID and Personal NPWP for responsibility. Non-admin users use Personal NPWP as account ID.'}
            </p>
            <div style={{ marginTop: 12 }}>
              <button className="btn primary" onClick={next} disabled={!company || !domain}>{t('action.continue')}</button>
            </div>
          </section>
        )}
        {step === 2 && (
          <section aria-labelledby="hierarchy">
            <h2 id="hierarchy">{t('onb.hierarchy_setup')}</h2>
            <p style={{ color: 'var(--text-secondary)' }}>{t('onb.add_departments')}</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input className="input" placeholder={t('onb.new_department')} onKeyDown={e => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  const name = e.currentTarget.value;
                  setDepartments(d => [...d, name]);
                  setDeptAlloc((prev: Record<string, number>) => ({ ...prev, [name]: Math.max(0, Math.round(budget * 0.1)) }));
                  e.currentTarget.value = '';
                }
              }} />
              <button className="btn" onClick={() => setDepartments(d => {
                const removed = d[d.length - 1];
                const next = d.slice(0, -1);
                setDeptAlloc(prev => { const copy = { ...prev }; delete copy[removed]; return copy; });
                return next;
              })}>{t('onb.remove_last')}</button>
            </div>
            <ul>
              {departments.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
            <div style={{ marginTop: 12 }}>
              <button className="btn" onClick={prev}>{t('action.back')}</button>
              <button className="btn primary" onClick={next} style={{ marginLeft: 8 }}>{t('action.continue')}</button>
            </div>
          </section>
        )}
        {step === 3 && (
          <section aria-labelledby="roles">
            <h2 id="roles">{t('onb.role_permissions')}</h2>
            <p style={{ color: 'var(--text-secondary)' }}>{t('onb.select_roles')}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {(['Admin', 'PIC Operational', 'PIC Procurement', 'PIC Finance'] as Role[]).map(r => (
                <label key={r} className="btn" style={{ justifyContent: 'space-between' }}>
                  <span>{r}</span>
                  <input type="checkbox" checked={roles.includes(r)} onChange={() => setRoles(x => x.includes(r) ? x.filter(z => z!==r) : [...x, r])} />
                </label>
              ))}
            </div>
            <div className="card" style={{ padding: 12, marginTop: 12 }}>
              <h3 style={{ marginTop: 0 }}>{t('onb.role_matrix')}</h3>
              <div role="table" style={{ display: 'grid', gridTemplateColumns: `160px repeat(${permissionKeys.length}, 1fr)`, gap: 8 }}>
                <div role="row" style={{ display: 'contents', fontSize: 12, color: 'var(--text-secondary)' }}>
                  <div></div>
                  {permissionKeys.map(pk => (<div key={pk}>{t('onb.' + pk)}</div>))}
                </div>
                {roles.map(r => (
                  <div role="row" key={r} style={{ display: 'contents' }}>
                    <div style={{ fontWeight: 600 }}>{r}</div>
                    {permissionKeys.map(pk => (
                      <div key={pk} style={{ textAlign: 'center' }}>
                        <input aria-label={`${r} ${pk}`} type="checkbox" checked={permissions[r][pk]} onChange={() => setPermissions(prev => ({
                          ...prev,
                          [r]: { ...prev[r], [pk]: !prev[r][pk] }
                        }))} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <button className="btn" onClick={prev}>{t('action.back')}</button>
              <button className="btn primary" onClick={next} style={{ marginLeft: 8 }}>{t('action.continue')}</button>
            </div>
          </section>
        )}
        {step === 4 && (
          <section aria-labelledby="budgets">
            <h2 id="budgets">{t('onb.budget_allocation')}</h2>
            <div className="card" style={{ padding: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <label className="input" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{t('onb.total_budget')}</span>
                  <input className="input" type="number" value={budget} onChange={e => setBudget(Number(e.target.value))} />
                </label>
                <div style={{ textAlign: 'right', color: totalAllocated > budget ? 'var(--secondary-gradient-start)' : 'var(--text-secondary)' }}>
                  {t('onb.remaining')}: <strong>{Math.max(0, budget - totalAllocated).toLocaleString()}</strong>
                </div>
              </div>
              <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
                {departments.map(d => {
                  const val = deptAlloc[d] ?? 0;
                  const pct = budget > 0 ? Math.round((val / budget) * 100) : 0;
                  return (
                    <div key={d}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 600 }}>{d}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input className="input" type="number" value={val} onChange={e => setDeptAlloc((prev: Record<string, number>) => ({ ...prev, [d]: Math.max(0, Number(e.target.value)) }))} />
                          <span className="status-badge info">{pct}%</span>
                        </div>
                      </div>
                      <div aria-label={`${d} ${pct}%`} style={{ marginTop: 8, height: 10, borderRadius: 6, background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 6, background: 'linear-gradient(90deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 40%, #000) 100%)' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 12 }}>
                <button className="btn" onClick={prev}>{t('action.back')}</button>
                <button className="btn primary" onClick={() => {
                  if (totalAllocated > budget) {
                    toast.push({ type: 'error', message: t('onb.err_over_budget') });
                    return;
                  }
                  toast.push({ type: 'success', message: t('onb.finish_success') });
                  localStorage.removeItem(DRAFT_KEY);
                  navigate('/');
                }} style={{ marginLeft: 8 }}>{t('onb.finish')}</button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
