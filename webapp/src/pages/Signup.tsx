import React, { useMemo } from 'react';
import { useI18n } from '../components/I18nProvider';
import { useTheme } from '../components/ThemeProvider';
import { useModule } from '../components/useModule';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  useModule('procurement');
  const { t } = useI18n();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const headerGradient = useMemo(() => (
    theme === 'dark'
      ? 'linear-gradient(90deg, #0A1F4D 0%, #0A0F2D 100%)'
      : 'linear-gradient(90deg, #E3F2FD 0%, #F8FAFF 100%)'
  ), [theme]);

  function chooseAdmin(type: 'supplier' | 'client') {
    try {
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
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{t('auth.admin_choice') || 'Admin options'}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button
                type="button"
                className="btn"
                aria-label={t('auth.supplier_admin') || 'Supplier Admin'}
                onClick={() => chooseAdmin('supplier')}
                style={{
                  background: 'linear-gradient(135deg, #00F0FF 0%, #0077FF 100%)',
                  boxShadow: '0 0 10px #00F0FF',
                }}
              >{t('auth.supplier_admin') || 'Supplier Admin'}</button>
              <button
                type="button"
                className="btn"
                aria-label={t('auth.client_admin') || 'Client Admin'}
                onClick={() => chooseAdmin('client')}
                style={{
                  background: 'linear-gradient(135deg, #B84DB8 0%, #7A2A7A 100%)',
                  boxShadow: '0 0 10px #FF00E5',
                }}
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

