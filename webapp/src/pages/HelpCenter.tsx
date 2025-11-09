import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../components/I18nProvider';

export default function HelpCenter() {
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  function copy(path: string) {
    try {
      navigator.clipboard.writeText(path);
      alert(t('clipboard.copied'));
    } catch {}
  }

  const docs = useMemo(() => ([
    { title: t('help.user_guide'), desc: t('help.user_guide_desc'), enPath: 'docs/USER_GUIDE.md', idPath: 'docs/id/USER_GUIDE.md' },
    { title: t('help.workflows'), desc: t('help.workflows_desc'), enPath: 'docs/WORKFLOWS.md', idPath: 'docs/id/WORKFLOWS.md' },
    { title: t('help.roles_permissions'), desc: t('help.roles_permissions_desc'), enPath: 'docs/ROLES_PERMISSIONS.md', idPath: 'docs/id/ROLES_PERMISSIONS.md' },
    { title: t('help.ui_theme_i18n'), desc: t('help.ui_theme_i18n_desc'), enPath: 'docs/UI_THEME_I18N.md', idPath: 'docs/id/UI_THEME_I18N.md' },
    { title: t('help.faq'), desc: t('help.faq_desc'), enPath: 'docs/FAQ.md', idPath: 'docs/id/FAQ.md' },
    { title: t('help.email'), desc: t('help.email_desc'), enPath: 'docs/EMAIL.md', idPath: 'docs/id/EMAIL.md' },
    { title: t('help.reporting'), desc: t('help.reporting_desc'), enPath: 'docs/REPORTING.md', idPath: 'docs/id/REPORTING.md' },
    { title: t('help.glossary'), desc: t('help.glossary_desc'), enPath: 'docs/GLOSSARY.md', idPath: 'docs/id/GLOSSARY.md' },
  ]), [t]);

  const filteredDocs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return docs;
    return docs.filter(d => d.title.toLowerCase().includes(q) || (d.desc || '').toLowerCase().includes(q));
  }, [docs, query]);

  const openDoc = (path: string, hash?: string) => {
    navigate(`/help/docs?file=${encodeURIComponent(path)}${hash ? `#${encodeURIComponent(hash)}` : ''}`);
  };

  return (
    <div className="main">
      <div className="page-header procurement" style={{ borderImage: 'linear-gradient(90deg, var(--module-color), var(--module-gradient-end)) 1' }}>
        <h1 style={{ margin: 0 }}>{t('help.title') || 'Help Center'}</h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{t('help.sub') || 'Guides, workflows, and quick links'}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0 16px' }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('help.searchPlaceholder') || 'Search help topics...'}
          className="input"
          style={{ minWidth: 260 }}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {filteredDocs.map(doc => (
          <HelpCard
            key={doc.title}
            title={doc.title}
            desc={doc.desc}
            enPath={doc.enPath}
            idPath={doc.idPath}
            copy={copy}
            openDoc={openDoc}
          />
        ))}
      </div>
      <div className="card" style={{ marginTop: 16, padding: 16 }}>
        <div style={{ fontWeight: 600 }}>{t('help.quick_actions') || 'Quick Actions'}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <a className="btn" href="/procurement/pr/new">{t('help.go_create_pr') || 'Create PR'}</a>
          <a className="btn" href="/procurement/quote-builder">{t('help.go_quote_builder') || 'Quote Builder'}</a>
          <a className="btn" href="/procurement/po/preview">{t('help.go_po_preview') || 'PO Preview'}</a>
          <a className="btn" href="/supply/order-tracker">{t('help.go_order_tracker') || 'Order Tracker'}</a>
          <a className="btn" href="/supplier/reporting">{t('help.go_reporting') || 'Reporting'}</a>
        </div>
        <p style={{ marginTop: 12, color: 'var(--text-secondary)' }}>
          {t('help.docs_hint') || 'Docs are included in the repository under /docs and mirrored for in-app viewing.'}
        </p>

        <div style={{ fontWeight: 600, marginTop: 16 }}>{t('help.featuredTopics') || 'Featured Topics'}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          <button className="btn" onClick={() => openDoc(language === 'en' ? 'docs/USER_GUIDE.md' : 'docs/id/USER_GUIDE.md', 'convert quote')}>{t('help.topicPOConversion') || 'Convert Quote → PO'}</button>
          <button className="btn" onClick={() => openDoc(language === 'en' ? 'docs/USER_GUIDE.md' : 'docs/id/USER_GUIDE.md', 'invoice')}>{t('help.topicInvoicing') || 'Invoicing & Payments'}</button>
          <button className="btn" onClick={() => openDoc(language === 'en' ? 'docs/WORKFLOWS.md' : 'docs/id/WORKFLOWS.md', 'lifecycle')}>{t('help.topicLifecycle') || 'Procurement Lifecycle'}</button>
        </div>
      </div>
    </div>
  );
}

function HelpCard({ title, desc, enPath, idPath, copy, openDoc }: { title: string; desc: string; enPath: string; idPath: string; copy: (p: string) => void; openDoc: (p: string) => void }) {
  const { t } = useI18n();
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ fontWeight: 600 }}>{title}</div>
      <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{desc}</div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button className="btn" onClick={() => openDoc(enPath)}>{t('help.openEnglish') || 'Open (EN)'}</button>
        <button className="btn" onClick={() => openDoc(idPath)}>{t('help.openIndonesian') || 'Open (ID)'}</button>
        <button className="btn ghost" onClick={() => copy(enPath)}>{t('help.copy_en_path') || 'Copy EN path'}</button>
        <button className="btn ghost" onClick={() => copy(idPath)}>{t('help.copy_id_path') || 'Copy ID path'}</button>
      </div>
    </div>
  );
}
