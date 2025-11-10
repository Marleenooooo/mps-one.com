import React, { useMemo, useState } from 'react';
import { useI18n } from '../components/I18nProvider';
import { useTheme } from '../components/ThemeProvider';
import { useModule } from '../components/useModule';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  useModule('procurement');
  const { t } = useI18n();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [company, setCompany] = useState('');
  const [npwp, setNpwp] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const headerGradient = 'linear-gradient(90deg, color-mix(in srgb, var(--module-color) 15%, var(--surface)) 0%, var(--surface) 100%)';

  function normalizeNpwp(input: string) {
    const digits = (input || '').replace(/[^0-9]/g, '');
    // Accept 15 (legacy) or 16 (NPWP16) digits
    const isValid = digits.length === 15 || digits.length === 16;
    // Simple formatting: use NPWP16 grouping if 16 digits, otherwise legacy mask
    let formatted = input.trim();
    if (digits.length === 16) {
      formatted = `${digits.slice(0,4)} ${digits.slice(4,8)} ${digits.slice(8,12)} ${digits.slice(12,16)}`;
    } else if (digits.length === 15) {
      formatted = `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5,8)}.${digits.slice(8,9)}-${digits.slice(9,12)}.${digits.slice(12,15)}`;
    }
    return { digits, isValid, formatted };
  }

  function chooseAdmin(type: 'supplier' | 'client') {
    const { digits, isValid, formatted } = normalizeNpwp(npwp);
    if (!company || !isValid) {
      setErr(!company ? 'Please input company name.' : 'Please input a valid NPWP (15 or 16 digits).');
      return;
    }
    try {
      localStorage.setItem('mpsone_company', company);
      localStorage.setItem('mpsone_npwp', formatted);
      localStorage.setItem('mpsone_npwp_digits', digits);
      // Admin account represents company; use NPWP digits as admin user id
      localStorage.setItem('mpsone_user_id', digits);
      localStorage.setItem('mpsone_user_type', type);
      localStorage.setItem('mpsone_role', 'Admin');
    } catch {}
    navigate(type === 'supplier' ? '/supplier/admin' : '/client');
  }

  function goCodeLogin() {
    navigate('/login/code');
  }

  return (
    <div className="main" role="main" style={{ display: 'grid', placeItems: 'center', minHeight: 'calc(100vh - 120px)' }}>
      <div className="card" style={{ width: 640, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 16, background: headerGradient, borderBottom: '1px solid var(--border)' }}>
          <h1 style={{ margin: 0 }}>{t('auth.signup_title') || 'Sign Up'}</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{t('auth.signup_subtitle') || 'Choose your admin type or use an access code.'}</p>
        </div>
        <div style={{ padding: 16, display: 'grid', gap: 16 }}>
          <div className="card" style={{ padding: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{t('auth.company_identity') || 'Company Identity (Admin)'}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <input className="input" placeholder={t('onb.company_name') || 'Company Name'} value={company} onChange={e => setCompany(e.target.value)} />
              <input className="input" placeholder={t('auth.npwp_placeholder') || 'NPWP (15/16 digits)'} value={npwp} onChange={e => setNpwp(e.target.value)} />
            </div>
            {err && <div role="alert" style={{ color: 'var(--secondary-gradient-start)', marginTop: 8, fontSize: 12 }}>{err}</div>}
            <div style={{ marginTop: 8, color: 'var(--text-secondary)', fontSize: 12 }}>
              {(t('auth.company_identity_hint') || 'Admin account represents the company account. NPWP is used as the admin user ID for credibility and auditability.')}
            </div>
          </div>
          <div className="card" style={{ padding: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{t('auth.admin_choice') || 'Admin options'}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button
                type="button"
                className="btn primary"
                aria-label={t('auth.supplier_admin') || 'Supplier Admin'}
                onClick={() => chooseAdmin('supplier')}
              >{t('auth.supplier_admin') || 'Supplier Admin'}</button>
              <button
                type="button"
                className="btn secondary"
                aria-label={t('auth.client_admin') || 'Client Admin'}
                onClick={() => chooseAdmin('client')}
              >{t('auth.client_admin') || 'Client Admin'}</button>
            </div>
            <div style={{ marginTop: 8, color: 'var(--text-secondary)', fontSize: 12 }}>
              {t('auth.admin_choice_hint') || 'Admins manage company setup and user invites.'}
            </div>
          </div>

          <div className="card" style={{ padding: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{t('auth.join_with_code') || 'Join with access code'}</div>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              {t('auth.join_with_code_hint') || 'If you are not an admin, use the code from your admin to set up your company, role, and department automatically.'}
            </p>
            <div style={{ marginTop: 8 }}>
              <button type="button" className="btn ghost" onClick={goCodeLogin} aria-label={t('auth.use_code') || 'Use Code'}>
                {t('auth.use_code') || 'Use Code'}
              </button>
            </div>
          </div>
        </div>
        <div style={{ padding: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)' }}>
          <span>{t('auth.security_notice')}</span>
          <span>{t('auth.version').replace('{v}', '0.1.0')}</span>
        </div>
      </div>
    </div>
  );
}
