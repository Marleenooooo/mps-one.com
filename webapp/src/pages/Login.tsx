import React, { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../components/I18nProvider';
import { useTheme } from '../components/ThemeProvider';
import { useModule } from '../components/useModule';
import { LoadingButton } from '../components/UI/LoadingButton';
import { useToast } from '../components/UI/Toast';
import { useNavigate } from 'react-router-dom';

type Role = 'Admin' | 'PIC Operational' | 'PIC Procurement' | 'PIC Finance';

export default function Login() {
  // Use procurement accent for login to align with primary module visual system
  useModule('procurement');
  const { t } = useI18n();
  const { theme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('PIC Procurement');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    const remembered = localStorage.getItem('remember_email');
    if (remembered) setEmail(remembered);
  }, []);

  useEffect(() => {
    if (remember) localStorage.setItem('remember_email', email);
    else localStorage.removeItem('remember_email');
  }, [email, remember]);

  const headerGradient = useMemo(() => (
    theme === 'dark'
      ? 'linear-gradient(90deg, #0A1F4D 0%, #0A0F2D 100%)'
      : 'linear-gradient(90deg, #E3F2FD 0%, #F8FAFF 100%)'
  ), [theme]);

  function validate() {
    const errs: { email?: string; password?: string } = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = t('auth.error_email');
    if (password.length < 6) errs.password = t('auth.error_password');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function onSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    toast.push({ type: 'success', message: t('auth.login_success').replace('{email}', email) });
    try {
      localStorage.setItem('mpsone_role', role);
    } catch {}
    const target = role === 'Admin' ? '/supplier/admin' : '/client';
    navigate(target);
  }

  return (
    <div className="main" role="main" style={{ display: 'grid', placeItems: 'center', minHeight: 'calc(100vh - 120px)' }}>
      <div className="card" style={{ width: 520, padding: 0, overflow: 'hidden', transition: 'transform .2s ease' }}
           onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.transform = 'translateY(-2px)')}
           onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.transform = 'translateY(0)')}>
        <div style={{ padding: 16, background: headerGradient, borderBottom: '1px solid var(--border)' }}>
          <h1 style={{ margin: 0 }}>{t('auth.login_title')}</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{t('auth.login_subtitle')}</p>
        </div>
        <form onSubmit={onSubmit} style={{ padding: 16 }}>
          <div style={{ display: 'grid', gap: 12 }}>
            <label>
              <div style={{ fontWeight: 600 }}>{t('auth.email')}</div>
              <input
                className="input"
                type="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-err' : undefined}
                placeholder="admin@company.co.id"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              {errors.email && (
                <div id="email-err" role="alert" style={{ color: '#FF2A50', marginTop: 4 }}>{errors.email}</div>
              )}
            </label>
            <label>
              <div style={{ fontWeight: 600 }}>{t('auth.password')}</div>
              <input
                className="input"
                type="password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'password-err' : undefined}
                placeholder={t('auth.password_placeholder')}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              {errors.password && (
                <div id="password-err" role="alert" style={{ color: '#FF2A50', marginTop: 4 }}>{errors.password}</div>
              )}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                {t('auth.remember_me')}
              </label>
              <div style={{ textAlign: 'right' }}>
                <a href="#" className="btn ghost" onClick={(e: React.MouseEvent<HTMLAnchorElement>) => { e.preventDefault(); toast.push({ type: 'info', message: t('auth.reset_via_admin') }); }}>{t('auth.forgot_password')}</a>
              </div>
            </div>
            <label>
              <div style={{ fontWeight: 600 }}>{t('auth.role')}</div>
              <select className="select" value={role} onChange={e => setRole(e.target.value as Role)}>
                {(['Admin','PIC Operational','PIC Procurement','PIC Finance'] as Role[]).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{t('auth.role_hint')}</div>
            </label>
            <LoadingButton onClick={onSubmit} style={{
              background: 'linear-gradient(135deg, var(--primary-gradient-start) 0%, var(--primary-gradient-end) 100%)',
              boxShadow: '0 0 10px var(--accent)',
              transform: 'scale(1)',
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.transform = 'scale(1)')}
            >{t('auth.sign_in')}</LoadingButton>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8 }}>
              <div style={{ height: 1, background: 'var(--border)' }}></div>
              <div style={{ color: 'var(--text-secondary)' }}>{t('auth.or')}</div>
              <div style={{ height: 1, background: 'var(--border)' }}></div>
            </div>
            <button type="button" className="btn" onClick={() => toast.push({ type: 'info', message: t('auth.sso_hint') })} style={{
              background: 'linear-gradient(135deg, var(--secondary-gradient-start) 0%, var(--secondary-gradient-end) 100%)'
            }}>{t('auth.sso')}</button>
          </div>
        </form>
        <div style={{ padding: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)' }}>
          <span>{t('auth.security_notice')}</span>
          <span>{t('auth.version').replace('{v}', '0.1.0')}</span>
        </div>
      </div>
    </div>
  );
}

