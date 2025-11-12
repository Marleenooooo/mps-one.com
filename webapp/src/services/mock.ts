// Mock API services for offline/frontend-only development
// Uses localStorage for persistence across reloads

const PR_KEY = 'mock_pr_rows';
const THREAD_KEY = 'mock_threads';
const DOCS_KEY = 'mock_docs';
// Social features stores (email-based identifiers for simplicity)
const USERS_KEY = 'mock_users';
const REL_KEY = 'mock_user_relationships';
const BLOCKS_KEY = 'mock_user_blocks';
const INVITES_KEY = 'mock_user_invites';

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

function getDocs(): any[] {
  try {
    const raw = localStorage.getItem(DOCS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

function setDocs(rows: any[]) {
  try { localStorage.setItem(DOCS_KEY, JSON.stringify(rows)); } catch {}
}

export async function apiCreateThread(input: { participants: any[]; messages?: any[]; subject?: string; pr_id?: number; po_id?: number }, role: string = 'PIC_Procurement') {
  const threads = getThreads();
  const id = Math.floor(Math.random() * 100000);
  const t = {
    id,
    subject: input.subject || '',
    participants: input.participants || [],
    messages: input.messages || [],
    created_at: nowISO(),
    role,
    labels: [],
    archived: false,
  };
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

export async function apiUpdateThreadMeta(id: number, patch: { labels?: string[]; archived?: boolean }) {
  const threads = getThreads();
  const idx = threads.findIndex(x => x.id === id);
  if (idx === -1) throw new Error('Thread not found');
  const current = threads[idx];
  threads[idx] = {
    ...current,
    labels: patch.labels ?? current.labels ?? [],
    archived: patch.archived ?? current.archived ?? false,
  };
  setThreads(threads);
  return threads[idx];
}

export async function apiListThreads(params: { pr_id?: number; po_id?: number }) {
  // Simple filter: attach pr_id/po_id labels in messages for demo purposes
  const all = getThreads();
  return { rows: all };
}

// Documents: upload/list (mock persistence)
export async function apiUploadDoc(input: { type: string; refId: number | null; url: string; canAccess?: string[]; storage_provider?: string; storage_key?: string; hash_sha256?: string }, _role: string = 'PIC_Operational') {
  const docs = getDocs();
  const id = Math.floor(Math.random() * 1000000);
  const doc = {
    id,
    type: input.type,
    ref_id: input.refId,
    url: input.url,
    can_access_json: input.canAccess || ['Admin','PIC_Procurement','PIC_Operational'],
    storage_provider: input.storage_provider || 'demo',
    storage_key: input.storage_key || `demo/${Date.now()}`,
    hash_sha256: input.hash_sha256 || String(id),
    created_at: nowISO(),
  };
  docs.unshift(doc);
  setDocs(docs);
  return { ok: true, id: doc.id, hash_sha256: doc.hash_sha256 };
}

export async function apiListDocs(params: { type?: string; refId?: number; limit?: number; offset?: number }) {
  const all = getDocs();
  let rows = all;
  if (params.type) rows = rows.filter(d => d.type === params.type);
  if (params.refId != null) rows = rows.filter(d => Number(d.ref_id) === Number(params.refId));
  const limit = Math.min(Math.max(Number(params.limit || 50), 1), 200);
  const offset = Math.max(Number(params.offset || 0), 0);
  rows = rows.slice(offset, offset + limit);
  return { ok: true, rows, pagination: { limit, offset } };
}

// ------------------------------
// Social features (users, follow, block, invites)
// ------------------------------

function seedUsers(): any[] {
  return [
    { id: 'u-1', name: 'Admin Supplier', email: 'admin@mpsone.co.id', role: 'Admin', user_type: 'supplier', nickname: 'Admin', status: 'active' },
    { id: 'u-2', name: 'PIC Procurement', email: 'procurement@mpsone.co.id', role: 'PIC_Procurement', user_type: 'supplier', nickname: 'Proc', status: 'active' },
    { id: 'u-3', name: 'PIC Finance', email: 'finance@mpsone.co.id', role: 'PIC_Finance', user_type: 'supplier', nickname: 'Fin', status: 'active' },
    { id: 'u-4', name: 'Client Admin', email: 'client.admin@company.co.id', role: 'Admin', user_type: 'client', nickname: 'CA', status: 'active' },
    { id: 'u-5', name: 'PIC Operational', email: 'ops@mpsone.co.id', role: 'PIC_Operational', user_type: 'supplier', nickname: 'Ops', status: 'active' },
  ];
}

function getUsers(): any[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    }
  } catch {}
  const seeded = seedUsers();
  try { localStorage.setItem(USERS_KEY, JSON.stringify(seeded)); } catch {}
  return seeded;
}

function setUsers(rows: any[]) {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(rows)); } catch {}
}

function getRelationships(): { follower: string; followee: string }[] {
  try {
    const raw = localStorage.getItem(REL_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

function setRelationships(rows: { follower: string; followee: string }[]) {
  try { localStorage.setItem(REL_KEY, JSON.stringify(rows)); } catch {}
}

function getBlocks(): { blocker: string; blocked: string }[] {
  try {
    const raw = localStorage.getItem(BLOCKS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

function setBlocks(rows: { blocker: string; blocked: string }[]) {
  try { localStorage.setItem(BLOCKS_KEY, JSON.stringify(rows)); } catch {}
}

function getInvites(): { id: string; from: string; to: string; status: 'pending'|'accepted'|'declined'; at: string }[] {
  try {
    const raw = localStorage.getItem(INVITES_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

function setInvites(rows: { id: string; from: string; to: string; status: 'pending'|'accepted'|'declined'; at: string }[]) {
  try { localStorage.setItem(INVITES_KEY, JSON.stringify(rows)); } catch {}
}

export async function apiListUsers() {
  return { rows: getUsers() };
}

export async function apiGetUserByEmail(email: string) {
  const u = getUsers().find(x => x.email === email);
  if (!u) throw new Error('User not found');
  return u;
}

export async function apiFollowUser(followerEmail: string, followeeEmail: string) {
  const rel = getRelationships();
  const blocks = getBlocks();
  if (blocks.some(b => (b.blocker === followerEmail && b.blocked === followeeEmail) || (b.blocker === followeeEmail && b.blocked === followerEmail))) {
    throw new Error('Cannot follow due to block');
  }
  if (!rel.some(r => r.follower === followerEmail && r.followee === followeeEmail)) {
    rel.push({ follower: followerEmail, followee: followeeEmail });
    setRelationships(rel);
  }
  return { ok: true };
}

export async function apiUnfollowUser(followerEmail: string, followeeEmail: string) {
  const rel = getRelationships().filter(r => !(r.follower === followerEmail && r.followee === followeeEmail));
  setRelationships(rel);
  return { ok: true };
}

export async function apiBlockUser(blockerEmail: string, blockedEmail: string) {
  const blocks = getBlocks();
  if (!blocks.some(b => b.blocker === blockerEmail && b.blocked === blockedEmail)) {
    blocks.push({ blocker: blockerEmail, blocked: blockedEmail });
    setBlocks(blocks);
  }
  // Remove follow relationships in both directions
  const rel = getRelationships().filter(r => !(r.follower === blockerEmail && r.followee === blockedEmail) && !(r.follower === blockedEmail && r.followee === blockerEmail));
  setRelationships(rel);
  return { ok: true };
}

export async function apiUnblockUser(blockerEmail: string, blockedEmail: string) {
  const blocks = getBlocks().filter(b => !(b.blocker === blockerEmail && b.blocked === blockedEmail));
  setBlocks(blocks);
  return { ok: true };
}

export async function apiListRelationships(email: string) {
  const rel = getRelationships();
  return {
    following: rel.filter(r => r.follower === email).map(r => r.followee),
    followers: rel.filter(r => r.followee === email).map(r => r.follower),
  };
}

export async function apiListBlocks(email: string) {
  const blocks = getBlocks();
  return {
    blocked: blocks.filter(b => b.blocker === email).map(b => b.blocked),
    blockedBy: blocks.filter(b => b.blocked === email).map(b => b.blocker),
  };
}

export async function apiInviteUser(fromEmail: string, toEmail: string) {
  const invites = getInvites();
  const id = String(Math.floor(Math.random() * 1000000));
  invites.push({ id, from: fromEmail, to: toEmail, status: 'pending', at: nowISO() });
  setInvites(invites);
  return { ok: true, id };
}

export async function apiIsConversationBlocked(participants: { email?: string }[]) {
  const me = (localStorage.getItem('mpsone_user_email') || 'you@local');
  const blocks = getBlocks();
  const counterpartyEmails = participants.map(p => p.email).filter(Boolean) as string[];
  const blocked = blocks.some(b => (b.blocker === me && counterpartyEmails.includes(b.blocked)) || (b.blocked === me && counterpartyEmails.includes(b.blocker)));
  return { blocked };
}

export async function apiListInvites(email: string) {
  const invites = getInvites();
  return {
    sent: invites.filter(i => i.from === email),
    received: invites.filter(i => i.to === email),
  };
}

export async function apiRespondInvite(id: string, status: 'accepted'|'declined') {
  const invites = getInvites();
  const idx = invites.findIndex(i => i.id === id);
  if (idx === -1) throw new Error('Invite not found');
  invites[idx].status = status;
  setInvites(invites);
  return { ok: true };
}

export async function apiCancelInvite(id: string) {
  const invites = getInvites().filter(i => i.id !== id);
  setInvites(invites);
  return { ok: true };
}
