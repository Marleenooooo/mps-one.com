import { Bell, Sun, Moon, HelpCircle, LogOut, Settings, User, ShoppingCart, Tag, Folder, FileText, Truck, MessageSquare, Mail, BarChart2, Search, Wrench, FlaskConical, Zap, DollarSign, TrendingUp, Download, Shuffle } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../ThemeProvider';
import { useI18n } from '../I18nProvider';
import { DEPARTMENTS, DEPARTMENTS_ID, getOverscanPrefs, setOverscanPrefs, OVERSCAN_DEFAULTS, getHighPerformance, setHighPerformance, getDebounceMs, getOfflineMode } from '../../config';
import { getPreferredLanguage } from '../../services/i18n';
import { listNotifications } from '../../services/notifications';
import * as pillarStorage from '../../services/pillarStorage';

export function Topbar({ children }: { children?: React.ReactNode }) {
  const { theme, toggle: toggleTheme, setTheme } = useTheme();
  const { language, setLanguage, t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(() => {
    try {
      const raw = localStorage.getItem('mock_notifications');
      const rows = raw ? JSON.parse(raw) : [];
      return rows.filter((r: any) => !r.is_read).length;
    } catch { return 0; }
  });
  const [highPerf, setHighPerf] = useState<boolean>(() => getHighPerformance());
  const offline = getOfflineMode();
  const role = (localStorage.getItem('mpsone_role') as string | null) || null;
  const userType = (localStorage.getItem('mpsone_user_type') as 'supplier' | 'client' | null) || null;
  const displayName = (localStorage.getItem('mpsone_display_name') as string | null) || null;
  const nickname = (localStorage.getItem('mpsone_nickname') as string | null) || null;
  const typeLabel = userType === 'supplier' ? (t('user.supplier') || 'Supplier') : userType === 'client' ? (t('user.client') || 'Client') : '';
  const identityLabel = [displayName || '', nickname ? `(${nickname})` : ''].filter(Boolean).join(' ');
  const loginLabel = [identityLabel, [typeLabel, role || ''].filter(Boolean).join(' ')].filter(Boolean).join(' — ');
  const modeLabel = userType === 'supplier' ? (t('mode.selling') || 'Selling') : userType === 'client' ? (t('mode.buying') || 'Buying') : '';

  useEffect(() => {
    (async () => {
      try {
        const rows = await listNotifications({ unread: true, limit: 200 });
        const count = Array.isArray(rows) ? rows.length : 0;
        if (count > 0) setUnreadCount(count);
      } catch {}
    })();
    const onFocus = () => {
      try {
        const raw = localStorage.getItem('mock_notifications');
        const rows = raw ? JSON.parse(raw) : [];
        setUnreadCount(rows.filter((r: any) => !r.is_read).length);
      } catch {}
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  function clearSession() {
    try {
      localStorage.removeItem('mpsone_role');
      localStorage.removeItem('mpsone_user_type');
      localStorage.removeItem('mpsone_jwt');
    } catch { /* noop */ }
    navigate('/login/client', { replace: true });
  }
  function resetProcurementCaches() {
    const keys = [
      'mpsone_pr_draft',
      'mpsone_pr_sent',
      'mpsone_quote_accepted',
      'mpsone_audit_trail',
      'mpsone_suppliers',
      'mpsone_po_from_quote',
      'mpsone_available_to_invoice',
    ];
    keys.forEach(k => pillarStorage.removeItem(k));
  }
  function switchMode(to: 'client' | 'supplier') {
    if (userType === to) return;
    try { localStorage.setItem('mpsone_user_type', to); } catch {}
    // Clear pillar-scoped procurement caches to avoid cross-mode bleed
    resetProcurementCaches();
    // Navigate to mode-specific landing to trigger layout reset
    if (to === 'client') {
      navigate('/client/quotes', { replace: true });
    } else {
      navigate('/supplier/reporting', { replace: true });
    }
    // Smooth UX touch
    try { setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0); } catch {}
  }
  const currentModule = (typeof document !== 'undefined' ? (document.documentElement.getAttribute('data-module') as string | null) : null) || 'procurement';
  const moduleLabel = (() => {
    switch (currentModule) {
      case 'finance': return 'Finance';
      case 'inventory': return 'Inventory';
      case 'reports': return 'Reports';
      case 'procurement':
      default: return 'Procurement';
    }
  })();
  return (
    <header className="topbar" role="banner">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Mode icon toggle (compact) */}
        {userType && (
          <button
            className="btn ghost"
            aria-label={userType === 'client' ? (t('mode.toggle_to_supplier') || 'Switch to Supplier mode') : (t('mode.toggle_to_client') || 'Switch to Client mode')}
            onClick={() => switchMode(userType === 'client' ? 'supplier' : 'client')}
            style={{ marginLeft: 4 }}
          >
            {userType === 'client' ? <ShoppingCart className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
          </button>
        )}
        {children}
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <span className="btn ghost" aria-label={(t('topbar.logged_in_as') || 'Logged in as') + ": " + (loginLabel || (t('auth.unknown') || 'Unknown'))}>
          <User className="w-4 h-4" /> {(t('topbar.logged_in_as') || 'Logged in as')}: {loginLabel || (t('auth.unknown') || 'Unknown')}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <QuickSearch />
        {offline && (
          <span className="status-badge info tooltip" data-tip={t('topbar.offline_mock') || 'Offline Mock Mode'} aria-label={t('topbar.offline_mock') || 'Offline Mock Mode'} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <FlaskConical className="w-4 h-4" /> {t('topbar.offline_mock') || 'Offline Mock Mode'}
          </span>
        )}
        <NotificationBell count={unreadCount} onClick={() => navigate('/notifications')} />
        {/* Theme toggle button (light/dark) */}
        <button
          className="btn ghost tooltip"
          data-tip={t('topbar.theme_toggle') || 'Toggle theme'}
          aria-label={t('topbar.theme_toggle') || 'Toggle theme'}
          onClick={toggleTheme}
        >
          {theme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
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
          <HelpCircle className="w-4 h-4" />
        </button>
        <button
          className="btn ghost tooltip"
          data-tip={t('topbar.logout') || 'Logout'}
          onClick={clearSession}
          aria-label={t('topbar.logout') || 'Logout'}
        >
          <LogOut className="w-4 h-4" />
        </button>
        <div style={{ position: 'relative' }}>
          <button
            className="btn outline tooltip"
            data-tip={t('topbar.settings') || 'Settings'}
            onClick={() => setSettingsOpen(o => !o)}
            aria-label={t('topbar.settings') || 'Settings'}
          >
            <Settings className="w-4 h-4" />
          </button>
          {settingsOpen && (
            <div onMouseLeave={() => setTimeout(() => setSettingsOpen(false), 140)}
                 className="card"
                 style={{ position: 'absolute', right: 0, top: '110%', minWidth: 320, padding: 12,
                          borderImage: 'linear-gradient(90deg, var(--module-color), var(--module-gradient-end)) 1',
                          zIndex: 60 }}>
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
      <ol style={{ listStyle: 'none', display: 'flex', alignItems: 'center', padding: 0, margin: 0 }}>
        {items.map((item, idx) => (
          <li key={item} style={{ display: 'flex', alignItems: 'center' }}>
            <span aria-current={idx === items.length - 1 ? 'page' : undefined}>{translateItem(item)}</span>
            {idx < items.length - 1 && (
              <span aria-hidden style={{ margin: '0 8px' }}>/</span>
            )}
          </li>
        ))}
      </ol>
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

  type Item = { label: string; path: string; icon: string; keywords: string[]; kind?: 'recent' | 'action' | 'link' | 'search'; group?: string; execute?: (q: string) => void; disabled?: boolean; tooltip?: string };
  type Recent = { path: string; label: string; icon: string; ts: number };
  type RecentSearch = { q: string; ts: number };

  const quickActions: Item[] = useMemo(() => ([
    // Only surface New PR in Procurement context to prevent cross-pillar bleed
    ...(typeof document !== 'undefined' && (document.documentElement.getAttribute('data-module') || 'procurement') === 'procurement'
      && (typeof localStorage !== 'undefined' ? localStorage.getItem('mpsone_user_type') === 'client' : true)
      ? [{ label: t('pr.new_pr') || 'New PR', path: '/procurement/pr/new', icon: 'zap', keywords: ['new', 'create', 'pr'], kind: 'action' as const }]
      : [])
  ]), [t]);

  // Build global shortcuts index
  const index: Item[] = useMemo(() => {
    const docUserGuide = language === 'id' ? 'docs/id/USER_GUIDE.md' : 'docs/USER_GUIDE.md';
    const docWorkflows = language === 'id' ? 'docs/id/WORKFLOWS.md' : 'docs/WORKFLOWS.md';
    const userType = (typeof localStorage !== 'undefined' ? localStorage.getItem('mpsone_user_type') : null);
    const canBuildQuote = (() => {
      try {
        if (userType !== 'supplier') return false;
        const supplierId = localStorage.getItem('mpsone_user_id');
        if (!supplierId) return false;
        const map = JSON.parse(pillarStorage.getItem('mpsone_pr_sent') || '{}');
        const prIds = Object.keys(map || {});
        for (const prId of prIds) {
          const list = Array.isArray(map[prId]) ? map[prId] : [];
          if (list.some((x: any) => String(x.supplierId) === String(supplierId))) return true;
        }
        return false;
      } catch { return false; }
    })();
    const base: Item[] = [];
    // Client-only items
    if (userType === 'client' || !userType) {
      base.push({ label: t('nav.purchase_requests') || 'Purchase Requests', path: '/procurement/pr', icon: 'file-text', keywords: ['pr', 'purchase request', 'procurement', 'requests'], kind: 'link' as const });
      base.push({ label: 'PO Preview', path: '/procurement/po/preview', icon: 'file-text', keywords: ['po', 'purchase order', 'preview'], kind: 'link' as const });
    }
    // Supplier-only items
    if (userType === 'supplier') {
      base.push({ label: t('nav.quote_builder') || 'Quote Builder', path: '/procurement/quote-builder', icon: 'message-square', keywords: ['quote', 'penawaran', 'builder'], kind: 'link' as const, disabled: (userType === 'supplier' && !canBuildQuote), tooltip: (userType === 'supplier' && !canBuildQuote) ? (t('gating.quote_builder_disabled') || 'Approve PRs and send to suppliers to build quotes') : undefined });
      base.push({ label: t('nav.reporting') || 'Reporting', path: '/supplier/reporting', icon: 'bar-chart-2', keywords: ['reporting', 'finance', 'invoice', 'analytics'], kind: 'link' as const });
    }
    // Shared items
    base.push({ label: t('nav.order_tracker') || 'Order Tracker', path: '/supply/order-tracker', icon: 'truck', keywords: ['delivery', 'tracking', 'order', 'shipment'], kind: 'link' as const });
    base.push({ label: t('nav.docs') || 'Document Manager', path: '/docs', icon: 'folder', keywords: ['documents', 'doc', 'versions', 'proof'], kind: 'link' as const });
    base.push({ label: t('nav.help') || 'Help Center', path: '/help', icon: 'help-circle', keywords: ['help', 'docs', 'guide'], kind: 'link' as const });
    base.push({ label: (t('help.topicPOConversion') || 'Convert Quote → PO'), path: `/help/docs?file=${encodeURIComponent(docUserGuide)}#${encodeURIComponent('convert quote')}` , icon: 'shuffle', keywords: ['convert', 'po', 'quote', 'guide'], kind: 'link' as const });
    base.push({ label: (t('help.topicInvoicing') || 'Invoicing & Payments'), path: `/help/docs?file=${encodeURIComponent(docUserGuide)}#${encodeURIComponent('invoice')}`, icon: 'dollar-sign', keywords: ['invoice', 'payment', 'finance'], kind: 'link' as const });
    base.push({ label: (t('help.topicLifecycle') || 'Procurement Lifecycle'), path: `/help/docs?file=${encodeURIComponent(docWorkflows)}#${encodeURIComponent('lifecycle')}`, icon: 'trending-up', keywords: ['lifecycle', 'workflow', 'procurement'], kind: 'link' as const });
    const mod = (typeof document !== 'undefined' ? (document.documentElement.getAttribute('data-module') as string | null) : null) || 'procurement';
    const isGlobal = (p: string) => p.startsWith('/help') || p.startsWith('/docs');
    const inContext = (p: string) => {
      if (isGlobal(p)) return true;
      switch (mod) {
        case 'inventory':
          return p.startsWith('/inventory/') || p.startsWith('/supply/order-tracker');
        case 'finance':
        case 'reports':
          return p.startsWith('/supplier/reporting');
        case 'procurement':
        default:
          return p.startsWith('/procurement/');
      }
    };
    return base.filter(item => inContext(item.path));
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
        icon: 'settings',
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
        reporting: { path: '/supplier/reporting', label: language === 'id' ? 'Buka Pelaporan' : 'Open Reporting', icon: 'bar-chart-2' },
        reports: { path: '/supplier/reporting', label: language === 'id' ? 'Buka Pelaporan' : 'Open Reporting', icon: 'bar-chart-2' },
        pelaporan: { path: '/supplier/reporting', label: 'Buka Pelaporan', icon: 'bar-chart-2' },
        laporan: { path: '/supplier/reporting', label: 'Buka Laporan', icon: 'bar-chart-2' },
        docs: { path: '/docs', label: language === 'id' ? 'Buka Dokumen' : 'Open Documents', icon: 'folder' },
        documents: { path: '/docs', label: language === 'id' ? 'Buka Dokumen' : 'Open Documents', icon: 'folder' },
        dokumen: { path: '/docs', label: 'Buka Dokumen', icon: 'folder' },
        help: { path: '/help', label: language === 'id' ? 'Buka Bantuan' : 'Open Help', icon: 'help-circle' },
        bantuan: { path: '/help', label: 'Buka Bantuan', icon: 'help-circle' },
        email: { path: '/supplier/email', label: language === 'id' ? 'Buka Email Dashboard' : 'Open Email Dashboard', icon: 'mail' },
        comms: { path: '/comms', label: language === 'id' ? 'Buka Komunikasi' : 'Open Communication', icon: 'message-square' },
        komunikasi: { path: '/comms', label: 'Buka Komunikasi', icon: 'message-square' },
        communication: { path: '/comms', label: language === 'id' ? 'Buka Komunikasi' : 'Open Communication', icon: 'message-square' },
        'order tracker': { path: '/supply/order-tracker', label: language === 'id' ? 'Buka Pelacakan Pesanan' : 'Open Order Tracker', icon: 'truck' },
        'pelacakan pesanan': { path: '/supply/order-tracker', label: 'Buka Pelacakan Pesanan', icon: 'truck' },
        tracker: { path: '/supply/order-tracker', label: language === 'id' ? 'Buka Pelacakan Pesanan' : 'Open Order Tracker', icon: 'truck' },
        procurement: { path: '/procurement/pr', label: language === 'id' ? 'Buka Permintaan Pembelian' : 'Open Purchase Requests', icon: 'file-text' },
        'purchase requests': { path: '/procurement/pr', label: language === 'id' ? 'Buka Permintaan Pembelian' : 'Open Purchase Requests', icon: 'file-text' },
        'permintaan pembelian': { path: '/procurement/pr', label: 'Buka Permintaan Pembelian', icon: 'file-text' },
        pr: { path: '/procurement/pr', label: language === 'id' ? 'Buka Permintaan Pembelian' : 'Open Purchase Requests', icon: 'file-text' },
        'quote builder': { path: '/procurement/quote-builder', label: language === 'id' ? 'Buka Penyusun Penawaran' : 'Open Quote Builder', icon: 'message-square' },
        'penyusun penawaran': { path: '/procurement/quote-builder', label: 'Buka Penyusun Penawaran', icon: 'message-square' },
      };
      const mItem = map[term];
      if (mItem) {
        // Apply gating when navigating to Quote Builder via typed command
        const userType = (typeof localStorage !== 'undefined' ? localStorage.getItem('mpsone_user_type') : null);
        const canBuildQuote = (() => {
          try {
            if (userType !== 'supplier') return false;
            const supplierId = localStorage.getItem('mpsone_user_id');
            if (!supplierId) return false;
            const map = JSON.parse(pillarStorage.getItem('mpsone_pr_sent') || '{}');
            const prIds = Object.keys(map || {});
            for (const prId of prIds) {
              const list = Array.isArray(map[prId]) ? map[prId] : [];
              if (list.some((x: any) => String(x.supplierId) === String(supplierId))) return true;
            }
            return false;
          } catch { return false; }
        })();
        const disabled = (mItem.path === '/procurement/quote-builder' && userType === 'supplier' && !canBuildQuote);
        return { label: mItem.label, path: mItem.path, icon: mItem.icon, keywords: ['open','goto',term], kind: 'action', group: 'Actions', disabled, tooltip: disabled ? (t('gating.quote_builder_disabled') || 'Approve PRs and send to suppliers to build quotes') : undefined };
      }
    }
    // Export PRs CSV (EN + ID)
    if (/^(export\s+prs?\s+csv|ekspor\s+pr\s+csv)$/i.test(s)) {
      return {
        label: language === 'id' ? 'Ekspor PR CSV' : 'Export PRs CSV',
        path: '/procurement/pr?action=export',
        icon: 'download',
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

  function renderIcon(s: string) {
    switch (s) {
      case '📊':
      case 'bar-chart-2': return <BarChart2 className="w-4 h-4" />;
      case '📁':
      case 'folder': return <Folder className="w-4 h-4" />;
      case '❓':
      case 'help-circle': return <HelpCircle className="w-4 h-4" />;
      case '📧':
      case 'mail': return <Mail className="w-4 h-4" />;
      case '💬':
      case 'message-square': return <MessageSquare className="w-4 h-4" />;
      case '🚚':
      case 'truck': return <Truck className="w-4 h-4" />;
      case '📝':
      case '📄':
      case 'file-text': return <FileText className="w-4 h-4" />;
      case '🏷️':
      case 'tag': return <Tag className="w-4 h-4" />;
      case '🔎':
      case 'search': return <Search className="w-4 h-4" />;
      case '🛠️':
      case 'wrench': return <Wrench className="w-4 h-4" />;
      case '⚡':
      case 'zap': return <Zap className="w-4 h-4" />;
      case '💵':
      case 'dollar-sign': return <DollarSign className="w-4 h-4" />;
      case '📈':
      case 'trending-up': return <TrendingUp className="w-4 h-4" />;
      case '⬇️':
      case 'download': return <Download className="w-4 h-4" />;
      case '⚙️':
      case 'settings': return <Settings className="w-4 h-4" />;
      case '🔀':
      case 'shuffle': return <Shuffle className="w-4 h-4" />;
      default: return <span aria-hidden>{s}</span>;
    }
  }

  const results = useMemo(() => {
    const qraw = debouncedQuery.trim();
    const q = qraw.toLowerCase();
    if (!q) {
      const recentItems: Item[] = recents
        .map(r => ({ label: r.label, path: r.path, icon: r.icon, keywords: [] as string[], kind: 'recent' as const, group: 'Recent Destinations' }))
        .filter(r => index.some(i => i.path === r.path) || r.path.startsWith('/'));
      const searchItems: Item[] = recentSearches.map(s => ({ label: s.q, path: '', icon: 'search', keywords: [] as string[], kind: 'search' as const, group: 'Recent Searches' }));
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
        icon: 'wrench',
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
          icon: 'tag',
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
          // Gating: block Quote Builder if disabled
          if (sel.path === '/procurement/quote-builder' && sel.disabled) {
            alert(sel.tooltip || (t('gating.quote_builder_disabled') || 'Approve PRs and send to suppliers to build quotes'));
            return;
          }
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
                  // Gating: block Quote Builder if disabled
                  if (r.path === '/procurement/quote-builder' && r.disabled) {
                    alert(r.tooltip || (t('gating.quote_builder_disabled') || 'Approve PRs and send to suppliers to build quotes'));
                    return;
                  }
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
              title={r.tooltip}
              aria-disabled={r.disabled ? true : undefined}
           >
              {renderIcon(r.icon)}
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
        <span><Folder className="w-4 h-4" /> {t('prefs.docs_overscan') || 'Documents overscan'}</span>
        <select className="select" value={docsLevel} onChange={e => setDocsLevel(e.target.value as any)}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span><FileText className="w-4 h-4" /> {t('prefs.pr_overscan') || 'PR list overscan'}</span>
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

function NotificationBell({ count, onClick }: { count: number, onClick?: () => void }) {
  const { t } = useI18n();
  return (
    <button className="btn ghost tooltip" data-tip={t('topbar.notifications')} aria-label={t('topbar.notifications')} onClick={onClick}>
      <Bell className="w-4 h-4" />
      {count > 0 && (
        <span aria-label={`${count} ${t('topbar.unread')}`} style={{
          background: 'var(--accent)', color: '#fff', borderRadius: 999, fontSize: 12,
          padding: '2px 6px', marginLeft: 6
        }}>{count}</span>
      )}
    </button>
  );
}
