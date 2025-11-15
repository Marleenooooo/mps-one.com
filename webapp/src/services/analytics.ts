import { currentContext } from './permissions';
import { trackEvent } from './monitoring';

type AnyMap<T> = Record<string, T>;

type RecordedEvent = {
  event: string;
  timestamp: number;
  userId: string;
  attributes?: AnyMap<any>;
};

const RECENT_KEY = 'mpsone_recent_events';
const SESSION_KEY = 'mpsone_session_id';
const FUNNEL_STORE = 'mpsone_funnel_progress';

function getUserId(): string {
  const uid = localStorage.getItem('mpsone_user_id') || '';
  const ut = localStorage.getItem('mpsone_user_type') || 'guest';
  const role = localStorage.getItem('mpsone_role') || 'Unknown';
  return uid ? uid : `${ut}:${role}`;
}

function pushRecent(ev: RecordedEvent) {
  try {
    const raw = localStorage.getItem(RECENT_KEY) || '[]';
    const arr = Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) as RecordedEvent[] : [];
    arr.unshift(ev);
    if (arr.length > 200) arr.length = 200;
    localStorage.setItem(RECENT_KEY, JSON.stringify(arr));
  } catch {}
}

function getRecent(): RecordedEvent[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY) || '[]';
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr as RecordedEvent[] : [];
  } catch { return []; }
}

function ensureSession(): string {
  let sid = localStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    try { localStorage.setItem(SESSION_KEY, sid); } catch {}
  }
  return sid;
}

const funnels: Record<string, string[]> = {
  procurement_workflow: ['PR Created','RFQ Sent','Quote Approved','PO Issued','Delivered','Paid'],
  supplier_onboarding: ['Application Submitted','KYC Verified','Approved','Active'],
};

type ProgressMap = Record<string, Record<string, number>>;

function getProgress(): ProgressMap {
  try {
    const raw = localStorage.getItem(FUNNEL_STORE) || '{}';
    const obj = JSON.parse(raw);
    return typeof obj === 'object' && obj ? obj as ProgressMap : {};
  } catch { return {}; }
}

function setProgress(p: ProgressMap) {
  try { localStorage.setItem(FUNNEL_STORE, JSON.stringify(p)); } catch {}
}

function recordFunnelStep(funnelName: string, userId: string, stepName: string) {
  const steps = funnels[funnelName] || [];
  const idx = steps.indexOf(stepName);
  if (idx < 0) return;
  const progress = getProgress();
  if (!progress[funnelName]) progress[funnelName] = {};
  const prev = progress[funnelName][userId] ?? -1;
  if (idx > prev) {
    progress[funnelName][userId] = idx;
    setProgress(progress);
  }
}

export function trackUserEvent(name: string, attributes: AnyMap<any> = {}) {
  const ev: RecordedEvent = { event: name, timestamp: Date.now(), userId: getUserId(), attributes };
  pushRecent(ev);
  trackEvent(name, attributes);
}

export function trackProcurementEvent(name: string, attributes: AnyMap<any> = {}) {
  const ev: RecordedEvent = { event: name, timestamp: Date.now(), userId: getUserId(), attributes };
  pushRecent(ev);
  trackEvent(name, { module: 'procurement', ...attributes });
  if (name === 'pr_created') recordFunnelStep('procurement_workflow', ev.userId, 'PR Created');
  if (name === 'rfq_sent') recordFunnelStep('procurement_workflow', ev.userId, 'RFQ Sent');
  if (name === 'quote_approved') recordFunnelStep('procurement_workflow', ev.userId, 'Quote Approved');
  if (name === 'po_issued') recordFunnelStep('procurement_workflow', ev.userId, 'PO Issued');
  if (name === 'delivered') recordFunnelStep('procurement_workflow', ev.userId, 'Delivered');
  if (name === 'paid') recordFunnelStep('procurement_workflow', ev.userId, 'Paid');
}

export function trackQuoteEvent(name: string, attributes: AnyMap<any> = {}) {
  const ev: RecordedEvent = { event: name, timestamp: Date.now(), userId: getUserId(), attributes };
  pushRecent(ev);
  trackEvent(name, { module: 'quote', ...attributes });
}

function getFunnelAnalyticsInternal(funnelName?: string): AnyMap<any> {
  const progress = getProgress();
  const names = funnelName ? [funnelName] : Object.keys(funnels);
  const result = names.map(name => {
    const steps = funnels[name] || [];
    const users = progress[name] ? Object.keys(progress[name]) : [];
    const total = users.length;
    const stepStats = steps.map((s, i) => {
      const atStep = users.filter(u => (progress[name][u] ?? -1) >= i).length;
      const prevAt = i > 0 ? users.filter(u => (progress[name][u] ?? -1) >= i - 1).length : atStep;
      const conv = total > 0 ? (atStep / total) * 100 : 0;
      const drop = total > 0 ? ((prevAt - atStep) / total) * 100 : 0;
      return { step: s, step_index: i, users_at_step: atStep, conversion_rate: conv, dropoff_rate: i > 0 ? drop : 0 };
    });
    const overall = total > 0 ? (users.filter(u => (progress[name][u] ?? -1) >= steps.length - 1).length / total) * 100 : 0;
    return { funnel_name: name, total_users: total, steps: stepStats, overall_conversion: overall, avg_duration_days: 0 };
  });
  return funnelName ? result[0] : { funnels: result, summary: { total_funnels: result.length, active_users: result.reduce((a, f) => a + (f.total_users || 0), 0) } };
}

function getSummaryInternal(): AnyMap<any> {
  const context = currentContext();
  const sid = ensureSession();
  const recent = getRecent();
  return {
    session_id: sid,
    total_events: recent.length,
    user_context: { mode: context.mode, role: context.role },
    funnels: Object.keys(funnels),
    cohorts: ['client_admin','client_pic_finance','supplier_admin','supplier_pic_procurement'],
    anomalies: ['price_variance','approval_delays'],
    recent_events: recent,
  };
}

export const analytics = {
  getSummary: getSummaryInternal,
  getFunnelAnalytics: getFunnelAnalyticsInternal,
};

