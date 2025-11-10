import React, { useMemo, useRef, useState } from 'react';
import { useI18n } from '../components/I18nProvider';
import { useTheme } from '../components/ThemeProvider';
import { useModule } from '../components/useModule';
import { useNavigate } from 'react-router-dom';
import { APP_CONFIG } from '../config';

type Provision = {
  code: string;
  type: 'supplier' | 'client';
  role: 'PIC Operational' | 'PIC Procurement' | 'PIC Finance' | 'Admin';
  company: string;
  department?: string;
  signature?: string;
};

// Mock code directory for demo purposes. In production, validate via API.
const MOCK_CODES: Provision[] = [
  { code: 'SUP-ADMIN-0001', type: 'supplier', role: 'Admin', company: 'MPSOne Supplier', signature: 'Rudi-Admin' },
  { code: 'CLI-OPS-1209', type: 'client', role: 'PIC Operational', company: 'Kalimantan Mining Group', department: 'Mining Ops', signature: 'Sari-OPS' },
  { code: 'CLI-PROC-9821', type: 'client', role: 'PIC Procurement', company: 'Borneo Minerals Co', department: 'Procurement', signature: 'Damar-PROC' },
  { code: 'CLI-FIN-312', type: 'client', role: 'PIC Finance', company: 'Samarinda Mining', department: 'Finance', signature: 'Wulan-FIN' },
];

export default function CodeLogin() {
  useModule('procurement');
  const { t } = useI18n();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [liveText, setLiveText] = useState('');
  const [stage, setStage] = useState<'code' | 'details'>('code');
  const [prov, setProv] = useState<Provision | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [nickname, setNickname] = useState('');
  const [personalNpwp, setPersonalNpwp] = useState('');
  const [companyNpwp, setCompanyNpwp] = useState('');

  const headerGradient = 'linear-gradient(90deg, color-mix(in srgb, var(--module-color) 15%, var(--surface)) 0%, var(--surface) 100%)';

  function normalizeNpwp(input: string) {
    const digits = (input || '').replace(/[^0-9]/g, '');
    const isValid = digits.length === 15 || digits.length === 16;
    let formatted = input.trim();
    if (digits.length === 16) {
      formatted = `${digits.slice(0,4)} ${digits.slice(4,8)} ${digits.slice(8,12)} ${digits.slice(12,16)}`;
    } else if (digits.length === 15) {
      formatted = `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5,8)}.${digits.slice(8,9)}-${digits.slice(9,12)}.${digits.slice(12,15)}`;
    }
    return { digits, isValid, formatted };
  }

  async function onSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const normalized = code.trim();
    // First, try placeholder API; fallback to mock on error
    try {
      const res = await fetch(`${APP_CONFIG.apiBase}/auth/provision/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: normalized })
      });
      if (res.ok) {
        const data = await res.json();
        const token = data.token as string | undefined;
        const prov = data.provisioning as Partial<Provision> | undefined;
        if (token) {
          localStorage.setItem('mpsone_jwt', token);
        }
        if (prov && prov.type && prov.role && prov.company) {
          try {
            localStorage.setItem('mpsone_user_type', prov.type);
            localStorage.setItem('mpsone_role', prov.role);
            localStorage.setItem('mpsone_company', prov.company);
            if (prov.department) localStorage.setItem('mpsone_department', prov.department);
            if (prov.signature) localStorage.setItem('mpsone_signature', prov.signature);
          } catch {}
          setLiveText(t('auth.code_success') || 'Access granted');
          setError(null);
          setProv({
            code: normalized,
            type: prov.type,
            role: prov.role as Provision['role'],
            company: prov.company,
            department: prov.department,
            signature: prov.signature,
          });
          setStage('details');
          return;
        }
      }
      // If API did not validate, fall through to mock
      throw new Error('Fallback to mock');
    } catch (err) {
      const prov = MOCK_CODES.find(p => p.code.toLowerCase() === normalized.toLowerCase());
      if (!prov) {
        setError(t('auth.code_invalid') || 'Invalid code');
        setLiveText(t('auth.code_invalid') || 'Invalid code');
        inputRef.current?.focus();
        return;
      }
      try {
        localStorage.setItem('mpsone_user_type', prov.type);
        localStorage.setItem('mpsone_role', prov.role);
        localStorage.setItem('mpsone_company', prov.company);
        if (prov.department) localStorage.setItem('mpsone_department', prov.department);
        if (prov.signature) localStorage.setItem('mpsone_signature', prov.signature);
        // Save a placeholder token in dev to simulate auth
        localStorage.setItem('mpsone_jwt', `dev.${prov.type}.${prov.role}.${prov.code}`);
      } catch {}
      setLiveText(t('auth.code_success') || 'Access granted');
      setError(null);
      setProv(prov);
      setStage('details');
    }
  }

  function onComplete() {
    if (!prov) return;
    if (!displayName) {
      setError('Please input display name.');
      return;
    }
    const personalCheck = normalizeNpwp(personalNpwp);
    if (!personalCheck.isValid) {
      setError('Please input a valid Personal NPWP (15 or 16 digits).');
      return;
    }
    try {
      localStorage.setItem('mpsone_display_name', displayName);
      localStorage.setItem('mpsone_nickname', nickname || '');
      localStorage.setItem('mpsone_personal_npwp', personalCheck.formatted);
      localStorage.setItem('mpsone_personal_npwp_digits', personalCheck.digits);
      if (prov.role === 'Admin') {
        const companyCheck = normalizeNpwp(companyNpwp);
        if (!companyCheck.isValid) {
          setError('Please input a valid Company NPWP (15 or 16 digits).');
          return;
        }
        localStorage.setItem('mpsone_company_npwp', companyCheck.formatted);
        localStorage.setItem('mpsone_company_npwp_digits', companyCheck.digits);
        // Admin account ID = Company NPWP digits
        localStorage.setItem('mpsone_user_id', companyCheck.digits);
      } else {
        // Non-admin account ID = Personal NPWP digits
        localStorage.setItem('mpsone_user_id', personalCheck.digits);
      }
    } catch {}
    navigate(prov.type === 'supplier' ? '/supplier/admin' : '/client');
  }

  return (
    <div className="main" role="main" style={{ display: 'grid', placeItems: 'center', minHeight: 'calc(100vh - 120px)' }}>
      <div className="card" style={{ width: 520, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 16, background: headerGradient, borderBottom: '1px solid var(--border)' }}>
          <h1 style={{ margin: 0 }}>{t('auth.use_code') || 'Use Code'}</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{t('auth.join_with_code_hint') || 'Enter the access code provided by your admin to auto-configure your account.'}</p>
        </div>
        {stage === 'code' && (
          <form onSubmit={onSubmit} style={{ padding: 16 }}>
            <div style={{ display: 'grid', gap: 12 }}>
              <label>
                <div style={{ fontWeight: 600 }}>{t('auth.code_number') || 'Code number'}</div>
                <input
                  ref={inputRef}
                  className="input"
                  type="text"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'code-err' : undefined}
                  placeholder="e.g. CLI-PROC-9821"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                />
                {error && (
                  <div id="code-err" role="alert" style={{ color: '#FF2A50', marginTop: 4 }}>{error}</div>
                )}
              </label>
              <button type="submit" className="btn" style={{
                background: 'linear-gradient(135deg, var(--primary-gradient-start) 0%, var(--primary-gradient-end) 100%)'
              }}>{t('auth.continue') || 'Continue'}</button>
            </div>
          </form>
        )}
        {stage === 'details' && (
          <div style={{ padding: 16 }}>
            <div className="card" style={{ padding: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{t('auth.identity_details') || 'Identity Details'}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <input className="input" placeholder={t('auth.display_name_placeholder') || 'Display Name'} value={displayName} onChange={e => setDisplayName(e.target.value)} />
                <input className="input" placeholder={t('auth.nickname_placeholder') || 'Nickname (optional)'} value={nickname} onChange={e => setNickname(e.target.value)} />
                {prov?.role === 'Admin' && (
                  <input className="input" placeholder={t('auth.company_npwp_placeholder') || 'Company NPWP (15/16 digits)'} value={companyNpwp} onChange={e => setCompanyNpwp(e.target.value)} />
                )}
                <input className="input" placeholder={t('auth.personal_npwp_placeholder') || 'Personal NPWP (15/16 digits)'} value={personalNpwp} onChange={e => setPersonalNpwp(e.target.value)} />
              </div>
              <div style={{ marginTop: 8, color: 'var(--text-secondary)', fontSize: 12 }}>
                {prov?.role === 'Admin'
                  ? (t('auth.company_identity_hint') || 'Admin must provide 2 NPWP numbers: Company NPWP (account ID) and Personal NPWP (responsibility).')
                  : (t('auth.non_admin_identity_hint') || 'Non-admin must provide Personal NPWP; it becomes your account ID.')}
              </div>
              <div style={{ marginTop: 12 }}>
                <button type="button" className="btn primary" onClick={onComplete}>{t('auth.finish') || 'Finish'}</button>
              </div>
            </div>
          </div>
        )}
        <div aria-live="polite" style={{ padding: 8, minHeight: 24, color: 'var(--text-secondary)' }}>{liveText}</div>
        <div style={{ padding: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)' }}>
          <span>{t('auth.security_notice')}</span>
          <span>{t('auth.version').replace('{v}', '0.1.0')}</span>
        </div>
      </div>
    </div>
  );
}

