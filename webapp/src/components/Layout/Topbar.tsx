import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeProvider';
import { useI18n } from '../I18nProvider';
import { DEPARTMENTS, DEPARTMENTS_ID, getOverscanPrefs, setOverscanPrefs, OVERSCAN_DEFAULTS, getHighPerformance, setHighPerformance, getDebounceMs } from '../../config';
import { getPreferredLanguage } from '../../services/i18n';

export function Topbar({ children }: { children?: React.ReactNode }) {
  const { theme, toggle: toggleTheme, setTheme } = useTheme();
  const { language, setLanguage, t } = useI18n();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [highPerf, setHighPerf] = useState<boolean>(() => getHighPerformance());
  const role = (localStorage.getItem('mpsone_role') as string | null) || null;
  const userType = (localStorage.getItem('mpsone_user_type') as 'supplier' | 'client' | null) || null;
  const typeLabel = userType === 'supplier' ? (t('user.supplier') || 'Supplier') : userType === 'client' ? (t('user.client') || 'Client') : '';
  const loginLabel = [typeLabel, role || ''].filter(Boolean).join(' ');

  function clearSession() {
    try {
      localStorage.removeItem('mpsone_role');
      localStorage.removeItem('mpsone_user_type');
      localStorage.removeItem('mpsone_jwt');
    } catch { /* noop */ }
    navigate('/login/client', { replace: true });
  }
  return (
    <header className="topbar" role="banner">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {children}
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <span className="btn ghost" aria-label={(t('topbar.logged_in_as') || 'Logged in as') + ": " + (loginLabel || (t('auth.unknown') || 'Unknown'))}>
          👤 {(t('topbar.logged_in_as') || 'Logged in as')}: {loginLabel || (t('auth.unknown') || 'Unknown')}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <QuickSearch />
        <NotificationBell count={3} />
        {/* Theme toggle button (light/dark) */}
        <button
          className="btn ghost tooltip"
          data-tip={t('topbar.theme_toggle') || 'Toggle theme'}
          aria-label={t('topbar.theme_toggle') || 'Toggle theme'}
          onClick={toggleTheme}
        >
          {theme === 'light' ? '☀️' : '🌙'}
        </button>
        {/* Language toggle button (EN/ID) */}
        <button
          className="btn ghost tooltip"
          data-tip={t('topbar.language_toggle') || 'Toggle language'}
          aria-label={t('topbar.language_toggle') || 'Toggle language'}
          onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
        >
          {(language || 'en').toUpperCase()}
        </button>
        <button
          className="btn ghost tooltip"
          data-tip={t('topbar.help') || 'Help'}
          onClick={() => navigate('/help')}
          aria-label={t('topbar.help') || 'Help'}
        >
          ❓
        </button>
        <button
          className="btn ghost tooltip"
          data-tip={t('topbar.logout') || 'Logout'}
          onClick={clearSession}
          aria-label={t('topbar.logout') || 'Logout'}
        >
          🚪
        </button>
        <div style={{ position: 'relative' }}>
          <button
            className="btn outline tooltip"
            data-tip={t('topbar.settings') || 'Settings'}
            onClick={() => setSettingsOpen(o => !o)}
            aria-label={t('topbar.settings') || 'Settings'}
          >
            ⚙️
          </button>
          {settingsOpen && (
            <div onMouseLeave={() => setTimeout(() => setSettingsOpen(false), 140)}
                 className="card"
                 style={{ position: 'absolute', right: 0, top: '110%', minWidth: 320, padding: 12,
                          borderImage: 'linear-gradient(90deg, var(--module-color), var(--module-gradient-end)) 1',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.15)', zIndex: 60 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{t('settings.title') || 'Settings'}</div>
              <div style={{ marginTop: 10 }}>
                <OverscanControl />
              </div>
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={highPerf} onChange={e => { const on = e.target.checked; setHighPerf(on); setHighPerformance(on); }} />
                  <span>{t('settings.high_performance') || 'High Performance'}</span>
                </label>
                <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{t('settings.hp_desc') || 'Boost overscan, more debounce'}</span>
              </div>
              <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                <div style={{ fontWeight: 500, marginBottom: 6 }}>{t('settings.shortcuts') || 'Keyboard Shortcuts'}</div>
                <ul style={{ margin: 0, paddingLeft: 16, color: 'var(--text-secondary)' }}>
                  <li>Ctrl + / — {t('shortcuts.open_search') || 'Open Global Search'}</li>
                  <li>Esc — {t('shortcuts.close') || 'Close/Cancel'}</li>
                  <li>Tab/Shift+Tab — {t('shortcuts.navigate') || 'Navigate results'}</li>
                  <li>Enter — {t('shortcuts.execute') || 'Execute'}</li>
                </ul>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                  <button className="btn outline" aria-label={t('settings.reset') || 'Reset to defaults'} onClick={() => {
                    try {
                      // Reset persisted keys
                      localStorage.removeItem('mpsone_theme');
                      localStorage.removeItem('mpsone_pref_overscan');
                      localStorage.removeItem('mpsone_pref_perf');
                    } catch {}
                    // Theme: system preference
                    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                    setTheme(prefersDark ? 'dark' : 'light');
                    // Language: preferred
                    const nextLang = getPreferredLanguage();
                    setLanguage(nextLang);
                    // Overscan: defaults
                    setOverscanPrefs(OVERSCAN_DEFAULTS);
                    // High Performance off
                    setHighPerformance(false);
                  }}>
                    {t('settings.reset') || 'Reset to defaults'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export function Breadcrumbs({ items }: { items: string[] }) {
  const { t } = useI18n();
  function translateItem(item: string) {
    // If item looks like a translation key (contains '.' and no spaces), translate it.
    if (item.includes('.') && !item.includes(' ')) {
      const translated = t(item);
      // Guard: if translation returns the key itself, fallback to the original item
      return translated !== item ? translated : item;
    }
    // Otherwise, treat the item as an already-translated label
    return item;
  }
  return (
    <nav aria-label="Breadcrumb" style={{ color: 'var(--text-secondary)' }}>
      {items.map((item, idx) => (
        <span key={item}>
          <span aria-current={idx === items.length - 1 ? 'page' : undefined}>{translateItem(item)}</span>
          {idx < items.length - 1 && <span style={{ margin: '0 8px' }}>/</span>}
        </span>
      ))}
    </nav>
  );
}

function QuickSearch() {
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceMs = getDebounceMs();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const RECENTS_KEY = 'global_search_recent';
  const SEARCHES_KEY = 'global_search_queries';

  type Item = { label: string; path: string; icon: string; keywords: string[]; kind?: 'recent' | 'action' | 'link' | 'search'; group?: string; execute?: (q: string) => void };
  type Recent = { path: string; label: string; icon: string; ts: number };
  type RecentSearch = { q: string; ts: number };

  const quickActions: Item[] = useMemo(() => ([
    { label: t('pr.new_pr') || 'New PR', path: '/procurement/pr/new', icon: '⚡', keywords: ['new', 'create', 'pr'], kind: 'action' },
  ]), [t]);

  // Build global shortcuts index
  const index: Item[] = useMemo(() => {
    const docUserGuide = language === 'id' ? 'docs/id/USER_GUIDE.md' : 'docs/USER_GUIDE.md';
    const docWorkflows = language === 'id' ? 'docs/id/WORKFLOWS.md' : 'docs/WORKFLOWS.md';
    return [
      { label: t('nav.purchase_requests') || 'Purchase Requests', path: '/procurement/pr', icon: '📝', keywords: ['pr', 'purchase request', 'procurement', 'requests'], kind: 'link' },
      { label: t('nav.quote_builder') || 'Quote Builder', path: '/procurement/quote-builder', icon: '💬', keywords: ['quote', 'penawaran', 'builder'], kind: 'link' },
      { label: 'PO Preview', path: '/procurement/po/preview', icon: '📄', keywords: ['po', 'purchase order', 'preview'], kind: 'link' },
      { label: t('nav.order_tracker') || 'Order Tracker', path: '/supply/order-tracker', icon: '🚚', keywords: ['delivery', 'tracking', 'order', 'shipment'], kind: 'link' },
      { label: t('nav.docs') || 'Document Manager', path: '/docs', icon: '📁', keywords: ['documents', 'doc', 'versions', 'proof'], kind: 'link' },
      { label: t('nav.reporting') || 'Reporting', path: '/supplier/reporting', icon: '📊', keywords: ['reporting', 'finance', 'invoice', 'analytics'], kind: 'link' },
      { label: t('nav.help') || 'Help Center', path: '/help', icon: '❓', keywords: ['help', 'docs', 'guide'], kind: 'link' },
      { label: (t('help.topicPOConversion') || 'Convert Quote → PO'), path: `/help/docs?file=${encodeURIComponent(docUserGuide)}#${encodeURIComponent('convert quote')}` , icon: '🔀', keywords: ['convert', 'po', 'quote', 'guide'], kind: 'link' },
      { label: (t('help.topicInvoicing') || 'Invoicing & Payments'), path: `/help/docs?file=${encodeURIComponent(docUserGuide)}#${encodeURIComponent('invoice')}`, icon: '💵', keywords: ['invoice', 'payment', 'finance'], kind: 'link' },
      { label: (t('help.topicLifecycle') || 'Procurement Lifecycle'), path: `/help/docs?file=${encodeURIComponent(docWorkflows)}#${encodeURIComponent('lifecycle')}`, icon: '📈', keywords: ['lifecycle', 'workflow', 'procurement'], kind: 'link' },
    ];
  }, [t, language]);

  const [recents, setRecents] = useState<Recent[]>(() => {
    try {
      const raw = localStorage.getItem(RECENTS_KEY);
      return raw ? JSON.parse(raw) as Recent[] : [];
    } catch { return []; }
  });
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>(() => {
    try {
      const raw = localStorage.getItem(SEARCHES_KEY);
      return raw ? JSON.parse(raw) as RecentSearch[] : [];
    } catch { return []; }
  });

  function saveRecents(next: Recent[]) {
    setRecents(next);
    try { localStorage.setItem(RECENTS_KEY, JSON.stringify(next.slice(0, 6))); } catch { /* noop */ }
  }
  function saveSearch(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    const next = [{ q: trimmed, ts: Date.now() }, ...recentSearches.filter(r => r.q !== trimmed)].slice(0, 8);
    setRecentSearches(next);
    try { localStorage.setItem(SEARCHES_KEY, JSON.stringify(next)); } catch {}
  }

  function parseTypedAction(qraw: string): Item | null {
    const s = qraw.trim();
    if (!s) return null;
    // Create PR actions (EN + ID)
    const m = (
      s.match(/^(create\s+pr|new\s+pr|pr)\s*[:\s]\s*(.+)$/i) ||
      s.match(/^(buat\s+(?:pr|permintaan(?:\s+pembelian)?)|pr\s+baru)\s*[:\s]\s*(.+)$/i)
    );
    if (m) {
      const dept = m[2].trim();
      return {
        label: `${language === 'id' ? 'Buat PR' : 'Create PR'}: ${dept}`,
        path: '/procurement/pr/new',
        icon: '⚙️',
        keywords: ['create','pr','department',dept],
        kind: 'action',
        group: 'Actions',
        execute: () => {
          try {
            const DRAFT_KEY = 'mpsone_pr_draft';
            const persisted = localStorage.getItem(DRAFT_KEY);
            const base = persisted ? JSON.parse(persisted) : {};
            const next = { title: base.title || '', department: dept, neededBy: base.neededBy || new Date().toISOString().slice(0,10), description: base.description || '', items: base.items || [], budgetCode: base.budgetCode || 'OPS-2024', approver: base.approver || 'PIC Procurement' };
            localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
          } catch {}
        }
      };
    }
    // Navigation actions (EN + ID)
    const nav = s.match(/^(open|go|buka|ke)\s+(reporting|reports|pelaporan|laporan|docs|documents|dokumen|help|bantuan|email|comms|komunikasi|communication|order\s*tracker|pelacakan\s*pesanan|tracker|procurement|purchase\s*requests|permintaan\s*pembelian|pr|quote\s*builder|penyusun\s*penawaran)$/i);
    if (nav) {
      const term = nav[2].toLowerCase();
      const map: Record<string, { path: string; label: string; icon: string }> = {
        reporting: { path: '/supplier/reporting', label: language === 'id' ? 'Buka Pelaporan' : 'Open Reporting', icon: '📊' },
        reports: { path: '/supplier/reporting', label: language === 'id' ? 'Buka Pelaporan' : 'Open Reporting', icon: '📊' },
        pelaporan: { path: '/supplier/reporting', label: 'Buka Pelaporan', icon: '📊' },
        laporan: { path: '/supplier/reporting', label: 'Buka Laporan', icon: '📊' },
        docs: { path: '/docs', label: language === 'id' ? 'Buka Dokumen' : 'Open Documents', icon: '📁' },
        documents: { path: '/docs', label: language === 'id' ? 'Buka Dokumen' : 'Open Documents', icon: '📁' },
        dokumen: { path: '/docs', label: 'Buka Dokumen', icon: '📁' },
        help: { path: '/help', label: language === 'id' ? 'Buka Bantuan' : 'Open Help', icon: '❓' },
        bantuan: { path: '/help', label: 'Buka Bantuan', icon: '❓' },
        email: { path: '/supplier/email', label: language === 'id' ? 'Buka Email Dashboard' : 'Open Email Dashboard', icon: '📧' },
        comms: { path: '/comms', label: language === 'id' ? 'Buka Komunikasi' : 'Open Communication', icon: '💬' },
        komunikasi: { path: '/comms', label: 'Buka Komunikasi', icon: '💬' },
        communication: { path: '/comms', label: language === 'id' ? 'Buka Komunikasi' : 'Open Communication', icon: '💬' },
        'order tracker': { path: '/supply/order-tracker', label: language === 'id' ? 'Buka Pelacakan Pesanan' : 'Open Order Tracker', icon: '🚚' },
        'pelacakan pesanan': { path: '/supply/order-tracker', label: 'Buka Pelacakan Pesanan', icon: '🚚' },
        tracker: { path: '/supply/order-tracker', label: language === 'id' ? 'Buka Pelacakan Pesanan' : 'Open Order Tracker', icon: '🚚' },
        procurement: { path: '/procurement/pr', label: language === 'id' ? 'Buka Permintaan Pembelian' : 'Open Purchase Requests', icon: '📝' },
        'purchase requests': { path: '/procurement/pr', label: language === 'id' ? 'Buka Permintaan Pembelian' : 'Open Purchase Requests', icon: '📝' },
        'permintaan pembelian': { path: '/procurement/pr', label: 'Buka Permintaan Pembelian', icon: '📝' },
        pr: { path: '/procurement/pr', label: language === 'id' ? 'Buka Permintaan Pembelian' : 'Open Purchase Requests', icon: '📝' },
        'quote builder': { path: '/procurement/quote-builder', label: language === 'id' ? 'Buka Penyusun Penawaran' : 'Open Quote Builder', icon: '💬' },
        'penyusun penawaran': { path: '/procurement/quote-builder', label: 'Buka Penyusun Penawaran', icon: '💬' },
      };
      const mItem = map[term];
      if (mItem) {
        return { label: mItem.label, path: mItem.path, icon: mItem.icon, keywords: ['open','goto',term], kind: 'action', group: 'Actions' };
      }
    }
    // Export PRs CSV (EN + ID)
    if (/^(export\s+prs?\s+csv|ekspor\s+pr\s+csv)$/i.test(s)) {
      return {
        label: language === 'id' ? 'Ekspor PR CSV' : 'Export PRs CSV',
        path: '/procurement/pr?action=export',
        icon: '⬇️',
        keywords: ['export','csv','pr'],
        kind: 'action',
        group: 'Actions',
      };
    }
    return null;
  }

  function score(q: string, item: Item): number {
    const l = item.label.toLowerCase();
    let s = 0;
    if (!q) s = 1; else {
      if (l.startsWith(q)) s += 12;
      if (l.includes(q)) s += 10;
      for (const k of item.keywords) {
        const kk = k.toLowerCase();
        if (kk.startsWith(q)) s += 9;
        if (kk.includes(q)) s += 7;
      }
      // simple fuzzy: all chars of q appear in order in label
      let i = 0;
      for (const ch of l) { if (i < q.length && ch === q[i]) i++; }
      s += Math.floor((i / Math.max(1, q.length)) * 6);
    }
    // recency boost
    const r = recents.find(x => x.path === item.path);
    if (r) {
      s += 2;
      if (Date.now() - r.ts < 24 * 3600_000) s += 1; // visited in last day
    }
    // quick action bias
    if (item.kind === 'action') s += 3;
    return s;
  }

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), debounceMs);
    return () => clearTimeout(id);
  }, [query, debounceMs]);

  const results = useMemo(() => {
    const qraw = debouncedQuery.trim();
    const q = qraw.toLowerCase();
    if (!q) {
      const recentItems: Item[] = recents
        .map(r => ({ label: r.label, path: r.path, icon: r.icon, keywords: [] as string[], kind: 'recent' as const, group: 'Recent Destinations' }))
        .filter(r => index.some(i => i.path === r.path) || r.path.startsWith('/'));
      const searchItems: Item[] = recentSearches.map(s => ({ label: s.q, path: '', icon: '🔎', keywords: [] as string[], kind: 'search' as const, group: 'Recent Searches' }));
      const shortcuts: Item[] = index.map(i => ({ ...i, group: 'Shortcuts' }));
      const qa: Item[] = quickActions.map(a => ({ ...a, group: 'Quick Actions' }));
      // Overscan preference quick toggle
      const prefs = getOverscanPrefs();
      const currentDoc = prefs.documents ?? OVERSCAN_DEFAULTS.documents;
      const currentPR = prefs.prList ?? OVERSCAN_DEFAULTS.prList;
      const level = (currentDoc <= 2 || currentPR <= 6) ? 'Low' : (currentDoc >= 4 || currentPR >= 10 ? 'High' : 'Medium');
      const overscanToggle: Item = {
        label: `${t('prefs.overscan') || 'Overscan'}: ${level}`,
        path: '',
        icon: '🛠️',
        keywords: ['overscan','virtualize','smooth'],
        kind: 'action',
        group: 'Preferences',
        execute: () => {
          const nextLevel = level === 'Low' ? 'Medium' : level === 'Medium' ? 'High' : 'Low';
          const nextPrefs = nextLevel === 'Low'
            ? { documents: 2, prList: 6 }
            : nextLevel === 'Medium'
              ? { documents: 3, prList: 8 }
              : { documents: 4, prList: 10 };
          setOverscanPrefs(nextPrefs);
        },
      };
      const merged = [...qa, ...recentItems, ...searchItems, ...shortcuts];
      merged.unshift(overscanToggle);
      const seen = new Set<string>();
      const uniq = merged.filter(it => { const key = it.kind === 'search' ? `search:${it.label}` : it.path; if (seen.has(key)) return false; seen.add(key); return true; });
      return uniq.slice(0, 12);
    }
    const typed = parseTypedAction(qraw);
    // Department suggestions when typing PR creation patterns
    const suggestDepts: Item[] = (() => {
      const looksPR = /\b(create\s+pr|new\s+pr|pr|buat\s+(?:pr|permintaan)|pr\s+baru)\b/i.test(qraw);
      const frag = qraw.split(/[:]/)[1]?.trim().toLowerCase() || '';
      if (!looksPR) return [];
      const deptList = language === 'id' ? DEPARTMENTS_ID : DEPARTMENTS;
      return deptList
        .filter(d => !frag || d.toLowerCase().includes(frag))
        .slice(0, 6)
        .map(d => ({
          label: `${language === 'id' ? 'Buat PR' : 'Create PR'}: ${d}`,
          path: '/procurement/pr/new',
          icon: '🏷️',
          keywords: [d,'department','pr'],
          kind: 'action',
          group: t('search.departments') || 'Departments',
          execute: () => {
            try {
              const DRAFT_KEY = 'mpsone_pr_draft';
              const persisted = localStorage.getItem(DRAFT_KEY);
              const base = persisted ? JSON.parse(persisted) : {};
              const next = { title: base.title || '', department: d, neededBy: base.neededBy || new Date().toISOString().slice(0,10), description: base.description || '', items: base.items || [], budgetCode: base.budgetCode || 'OPS-2024', approver: base.approver || 'PIC Procurement' };
              localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
            } catch {}
          }
        }));
    })();
    const scored = [...quickActions, ...index, ...suggestDepts]
      .map(it => ({ it, s: score(q, it) }))
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map(x => ({ ...x.it, group: 'Results' }));
    const out = typed ? [typed, ...scored] : scored;
    return out.slice(0, 10);
  }, [index, debouncedQuery, recents, quickActions, recentSearches]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      const sel = results[active];
      if (sel) {
        if (sel.kind === 'search') {
          setQuery(sel.label);
          saveSearch(sel.label);
          setActive(0);
          return;
        }
        setOpen(false);
        saveSearch(query);
        setQuery(''); setActive(0);
        if (typeof sel.execute === 'function') sel.execute(query);
        if (sel.path) {
          const next: Recent[] = [{ path: sel.path, label: sel.label, icon: sel.icon, ts: Date.now() }, ...recents.filter(r => r.path !== sel.path)];
          saveRecents(next);
          navigate(sel.path);
        }
      }
    } else if (e.key === 'Escape') { setOpen(false); }
  }

  return (
    <div className="tooltip" data-tip="Quick search (Ctrl+/)" style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        value={query}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 100)}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={onKeyDown}
        className="input"
        placeholder={t('topbar.quick_search')}
        aria-label="Quick search"
        style={{ minWidth: 220 }}
      />
      {open && (
        <div role="listbox" aria-label="Global search results" style={{
          position: 'absolute', top: '110%', left: 0, right: 0,
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8,
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)', zIndex: 50
        }}>
          {results.length === 0 && (
            <div style={{ padding: 8, color: 'var(--text-secondary)' }}>No results</div>
          )}
          {results.map((r, i) => (
            <button
              key={r.label + r.path}
              role="option"
              aria-selected={i === active}
              className="btn ghost"
              onMouseEnter={() => setActive(i)}
              onMouseDown={e => e.preventDefault()}
              onClick={() => {
                if (r.kind === 'search') { setQuery(r.label); saveSearch(r.label); setActive(0); return; }
                setOpen(false);
                saveSearch(query);
                setQuery(''); setActive(0);
                if (typeof r.execute === 'function') r.execute(query);
                if (r.path) {
                  const next: Recent[] = [{ path: r.path, label: r.label, icon: r.icon, ts: Date.now() }, ...recents.filter(x => x.path !== r.path)];
                  saveRecents(next);
                  navigate(r.path);
                }
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', justifyContent: 'flex-start', padding: '8px 12px',
                background: i === active ? 'rgba(var(--module-rgb), 0.08)' : 'transparent',
                borderLeft: i === active ? '3px solid var(--module-color)' : '3px solid transparent',
                boxShadow: i === active ? '0 0 10px var(--module-color)' : 'none'
              }}
            >
              <span aria-hidden>{r.icon}</span>
              <span>{/* highlight match in label */}
                {(() => {
                  const q = query.trim();
                  if (!q) return r.label;
                  const idx = r.label.toLowerCase().indexOf(q.toLowerCase());
                  if (idx === -1) return r.label;
                  const before = r.label.slice(0, idx);
                  const match = r.label.slice(idx, idx + q.length);
                  const after = r.label.slice(idx + q.length);
                  return (<>
                    {before}<span style={{ background: 'rgba(var(--module-rgb), 0.15)', borderRadius: 4, padding: '0 2px' }}>{match}</span>{after}
                  </>);
                })()}
              </span>
              {r.group && (
                <span style={{ marginLeft: 'auto', color: 'var(--text-disabled)', fontSize: 11 }}>{r.group}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function OverscanControl() {
  const { t } = useI18n();
  const prefs = getOverscanPrefs();
  const [docsLevel, setDocsLevel] = useState<'Low' | 'Medium' | 'High'>(() => {
    const current = prefs.documents ?? OVERSCAN_DEFAULTS.documents;
    return current <= 2 ? 'Low' : current >= 4 ? 'High' : 'Medium';
  });
  const [prLevel, setPrLevel] = useState<'Low' | 'Medium' | 'High'>(() => {
    const current = prefs.prList ?? OVERSCAN_DEFAULTS.prList;
    return current <= 6 ? 'Low' : current >= 10 ? 'High' : 'Medium';
  });
  useEffect(() => {
    const val = docsLevel === 'Low' ? 2 : docsLevel === 'Medium' ? 3 : 4;
    setOverscanPrefs({ documents: val });
  }, [docsLevel]);
  useEffect(() => {
    const val = prLevel === 'Low' ? 6 : prLevel === 'Medium' ? 8 : 12;
    setOverscanPrefs({ prList: val });
  }, [prLevel]);
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div style={{ fontWeight: 500 }}>{t('prefs.overscan') || 'Overscan'}</div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>📁 {t('prefs.docs_overscan') || 'Documents overscan'}</span>
        <select className="select" value={docsLevel} onChange={e => setDocsLevel(e.target.value as any)}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>📝 {t('prefs.pr_overscan') || 'PR list overscan'}</span>
        <select className="select" value={prLevel} onChange={e => setPrLevel(e.target.value as any)}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </label>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
        {t('prefs.overscan_desc') || 'Controls preloaded rows for smoother scrolling per module.'}
      </div>
    </div>
  );
}

function NotificationBell({ count }: { count: number }) {
  const { t } = useI18n();
  return (
    <button className="btn ghost tooltip" data-tip={t('topbar.notifications')} aria-label={t('topbar.notifications')}>
      🔔
      {count > 0 && (
        <span aria-label={`${count} ${t('topbar.unread')}`} style={{
          background: 'var(--accent)', color: '#fff', borderRadius: 999, fontSize: 12,
          padding: '2px 6px', marginLeft: 6
        }}>{count}</span>
      )}
    </button>
  );
}
