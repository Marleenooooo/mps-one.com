import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useI18n } from '../components/I18nProvider';

export default function DocViewer() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language, setLanguage } = useI18n();
  const file = searchParams.get('file') || 'docs/USER_GUIDE.md';
  const [md, setMd] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const altFile = useMemo(() => {
    if (file.startsWith('docs/id/')) return file.replace('docs/id/', 'docs/');
    if (file.startsWith('docs/')) return file.replace('docs/', 'docs/id/');
    return file;
  }, [file]);

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`/${file}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed to load ${file}`);
        const text = await res.text();
        setMd(text);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [file]);

  useEffect(() => {
    const hash = location.hash?.replace('#', '').toLowerCase();
    if (!hash) return;
    // Scroll to a heading that loosely matches the hash token
    const tryScroll = () => {
      const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')) as HTMLElement[];
      const target = headings.find((h) => h.innerText.toLowerCase().includes(hash));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    // Give markdown a moment to render
    const id = setTimeout(tryScroll, 250);
    return () => clearTimeout(id);
  }, [md, location.hash]);

  const openFile = (next: string) => {
    navigate(`/help/docs?file=${encodeURIComponent(next)}${location.hash || ''}`);
  };

  const onToggleLanguage = () => {
    // Switch app language and open alt file path
    setLanguage(language === 'en' ? 'id' : 'en');
    openFile(altFile);
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button onClick={() => navigate('/help')} style={{ padding: '6px 12px' }}>{t('help.back')}</button>
        <div style={{ flex: 1 }} />
        <button onClick={onToggleLanguage} style={{ padding: '6px 12px' }}>{t('help.toggleLanguage')}</button>
        <button onClick={() => openFile(altFile)} style={{ padding: '6px 12px' }}>{t('help.openAlternate')}</button>
      </div>

      <div style={{ marginBottom: 12, color: '#5A6178' }}>
        <strong>{t('help.viewing')}:</strong> <code>{file}</code>
      </div>

      {loading && <div>{t('help.loading')}</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {!loading && !error && (
        <div className="doc-markdown" style={{ background: 'var(--surface, #F8FAFF)', padding: 16, borderRadius: 8 }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
