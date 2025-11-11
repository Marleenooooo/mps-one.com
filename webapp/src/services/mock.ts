// Mock API services for offline/frontend-only development
// Uses localStorage for persistence across reloads

const PR_KEY = 'mock_pr_rows';
const THREAD_KEY = 'mock_threads';

function nowISO() {
  return new Date().toISOString();
}

function seedPRs(): any[] {
  return [
    { id: 'PR-443', title: 'Hydraulic Hoses', status: 'Approved', need_date: '2025-12-15', approver: 'PIC Finance' },
    { id: 'PR-444', title: 'Excavator Bucket', status: 'Submitted', need_date: '2025-12-10', approver: 'PIC Procurement' },
    { id: 'PR-445', title: 'Safety Helmets', status: 'Draft', need_date: '2025-12-08', approver: 'PIC Procurement' },
  ];
}

function getPRs(): any[] {
  try {
    const raw = localStorage.getItem(PR_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    }
  } catch {}
  const seeded = seedPRs();
  try { localStorage.setItem(PR_KEY, JSON.stringify(seeded)); } catch {}
  return seeded;
}

function setPRs(rows: any[]) {
  try { localStorage.setItem(PR_KEY, JSON.stringify(rows)); } catch {}
}

export async function apiHealth() {
  return { version: 'mock-1.0', db: 'offline' };
}

export async function apiPOSummary() {
  return {
    rows: [
      { po_id: 'PO-1001', ordered_qty: 120, confirmed_qty: 80 },
      { po_id: 'PO-1002', ordered_qty: 50, confirmed_qty: 50 },
    ],
  };
}

export async function apiInvoiceStatus() {
  return {
    rows: [
      { invoice_id: 'INV-123', po_id: 'PO-1001', amount: 5000000, due_date: '2025-12-01', derived_status: 'Due', paid_at: null },
      { invoice_id: 'INV-124', po_id: 'PO-1002', amount: 3200000, due_date: '2025-12-05', derived_status: 'Paid', paid_at: '2025-11-01' },
    ],
  };
}

export async function apiListPR() {
  return { rows: getPRs() };
}

export async function apiGetPR(id: number | string) {
  const rows = getPRs();
  const found = rows.find(r => String(r.id) === String(id));
  if (!found) throw new Error('PR not found');
  return found;
}

export async function apiCreatePR(payload: any, role: string = 'PIC_Procurement') {
  const rows = getPRs();
  const nextId = `PR-${Math.floor(1000 + Math.random() * 9000)}`;
  const row = {
    id: nextId,
    title: payload?.title ?? 'Untitled',
    status: 'Submitted',
    need_date: payload?.neededBy ?? nowISO().slice(0,10),
    approver: payload?.approver ?? role,
  };
  rows.unshift(row);
  setPRs(rows);
  return { ok: true, id: nextId, row };
}

export async function apiUpdatePR(id: number | string, patch: any) {
  const rows = getPRs();
  const idx = rows.findIndex(r => String(r.id) === String(id));
  if (idx === -1) throw new Error('PR not found');
  rows[idx] = { ...rows[idx], ...patch };
  setPRs(rows);
  return { ok: true, row: rows[idx] };
}

export async function apiDeletePR(id: number | string) {
  const rows = getPRs().filter(r => String(r.id) !== String(id));
  setPRs(rows);
  return { ok: true };
}

// Email threads (simplified mock)
function getThreads(): any[] {
  try {
    const raw = localStorage.getItem(THREAD_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

function setThreads(rows: any[]) {
  try { localStorage.setItem(THREAD_KEY, JSON.stringify(rows)); } catch {}
}

export async function apiCreateThread(input: { participants: any[]; messages?: any[] }, role: string = 'PIC_Procurement') {
  const threads = getThreads();
  const id = Math.floor(Math.random() * 100000);
  const t = { id, participants: input.participants || [], messages: input.messages || [], created_at: nowISO(), role };
  threads.unshift(t);
  setThreads(threads);
  return t;
}

export async function apiGetThread(id: number) {
  const t = getThreads().find(x => x.id === id);
  if (!t) throw new Error('Thread not found');
  return t;
}

export async function apiAppendThreadMessage(id: number, message: any, role: string = 'PIC_Operational') {
  const threads = getThreads();
  const idx = threads.findIndex(x => x.id === id);
  if (idx === -1) throw new Error('Thread not found');
  const msg = { at: nowISO(), role, message };
  threads[idx].messages.push(msg);
  setThreads(threads);
  return threads[idx];
}

export async function apiListThreads(params: { pr_id?: number; po_id?: number }) {
  // Simple filter: attach pr_id/po_id labels in messages for demo purposes
  const all = getThreads();
  return { rows: all };
}

