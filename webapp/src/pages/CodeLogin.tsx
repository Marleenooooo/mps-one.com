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

  const headerGradient = useMemo(() => (
    theme === 'dark'
      ? 'linear-gradient(90deg, #0A1F4D 0%, #0A0F2D 100%)'
      : 'linear-gradient(90deg, #E3F2FD 0%, #F8FAFF 100%)'
  ), [theme]);

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
          navigate(prov.type === 'supplier' ? '/supplier/admin' : '/client');
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
      navigate(prov.type === 'supplier' ? '/supplier/admin' : '/client');
    }
  }

  return (
    <div className="main" role="main" style={{ display: 'grid', placeItems: 'center', minHeight: 'calc(100vh - 120px)' }}>
      <div className="card" style={{ width: 520, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 16, background: headerGradient, borderBottom: '1px solid var(--border)' }}>
          <h1 style={{ margin: 0 }}>{t('auth.use_code') || 'Use Code'}</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{t('auth.join_with_code_hint') || 'Enter the access code provided by your admin to auto-configure your account.'}</p>
        </div>
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
        <div aria-live="polite" style={{ padding: 8, minHeight: 24, color: 'var(--text-secondary)' }}>{liveText}</div>
        <div style={{ padding: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)' }}>
          <span>{t('auth.security_notice')}</span>
          <span>{t('auth.version').replace('{v}', '0.1.0')}</span>
        </div>
      </div>
    </div>
  );
}

