import { API_BASE, getOfflineMode } from '../config';
import * as mock from './mock';
import { startSpan, endSpan } from './monitoring';

async function request(input: RequestInfo, init?: RequestInit, spanName?: string) {
  const s = startSpan(spanName || 'http_request', { url: typeof input === 'string' ? input : (input as any)?.url, method: (init?.method || 'GET') });
  try {
    const res = await fetch(input, init);
    endSpan(s, { status: res.status, ok: res.ok });
    return res;
  } catch (e: any) {
    endSpan(s, { error: String(e?.message || e) });
    throw e;
  }
}

const OFFLINE = getOfflineMode();

export async function apiHealth() {
  if (OFFLINE) return mock.apiHealth();
  const res = await request(`${API_BASE}/health`, undefined, 'api_health');
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export async function apiPOSummary() {
  if (OFFLINE) return mock.apiPOSummary();
  const res = await request(`${API_BASE}/po/summary`, undefined, 'api_po_summary');
  if (!res.ok) throw new Error(`PO summary failed: ${res.status}`);
  return res.json();
}

export async function apiInvoiceStatus() {
  if (OFFLINE) return mock.apiInvoiceStatus();
  const res = await request(`${API_BASE}/invoice/status`, undefined, 'api_invoice_status');
  if (!res.ok) throw new Error(`Invoice status failed: ${res.status}`);
  return res.json();
}

// --- PR CRUD ---
export async function apiListPR() {
  if (OFFLINE) return mock.apiListPR();
  const res = await request(`${API_BASE}/pr`, undefined, 'api_list_pr');
  if (!res.ok) throw new Error(`List PR failed: ${res.status}`);
  return res.json();
}

export async function apiGetPR(id: number) {
  if (OFFLINE) return mock.apiGetPR(id);
  const res = await request(`${API_BASE}/pr/${id}`, undefined, 'api_get_pr');
  if (!res.ok) throw new Error(`Get PR failed: ${res.status}`);
  return res.json();
}

export async function apiCreatePR(payload: any, role: string = 'PIC_Procurement') {
  if (OFFLINE) return mock.apiCreatePR(payload, role);
  const res = await request(`${API_BASE}/pr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-role': role, 'x-user-type': (localStorage.getItem('mpsone_user_type') === 'supplier' ? 'Supplier' : 'Client') },
    body: JSON.stringify(payload),
  }, 'api_create_pr');
  if (!res.ok) {
    let msg = `Create PR failed: ${res.status}`;
    try { const j = await res.json(); if (j?.error) msg = j.error; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function apiUpdatePR(id: number, patch: any, role: string = 'PIC_Procurement') {
  if (OFFLINE) return mock.apiUpdatePR(id, patch);
  const res = await request(`${API_BASE}/pr/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-role': role, 'x-user-type': (localStorage.getItem('mpsone_user_type') === 'supplier' ? 'Supplier' : 'Client') },
    body: JSON.stringify(patch),
  }, 'api_update_pr');
  if (!res.ok) throw new Error(`Update PR failed: ${res.status}`);
  return res.json();
}

export async function apiDeletePR(id: number, role: string = 'Admin') {
  if (OFFLINE) return mock.apiDeletePR(id);
  const res = await request(`${API_BASE}/pr/${id}`, { method: 'DELETE', headers: { 'x-role': role, 'x-user-type': (localStorage.getItem('mpsone_user_type') === 'supplier' ? 'Supplier' : 'Client') } }, 'api_delete_pr');
  if (!res.ok) throw new Error(`Delete PR failed: ${res.status}`);
  return res.json();
}

// --- Email Thread (send/receive)
export async function apiCreateThread(input: { participants: any[]; messages?: any[]; subject?: string; pr_id?: number; po_id?: number }, role: string = 'PIC_Procurement') {
  if (OFFLINE) return mock.apiCreateThread(input, role);
  const res = await request(`${API_BASE}/email-thread`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-role': role, 'x-user-type': (localStorage.getItem('mpsone_user_type') === 'supplier' ? 'Supplier' : 'Client') },
    body: JSON.stringify(input),
  }, 'api_create_thread');
  if (!res.ok) throw new Error(`Create thread failed: ${res.status}`);
  return res.json();
}

export async function apiGetThread(id: number) {
  if (OFFLINE) return mock.apiGetThread(id);
  const res = await request(`${API_BASE}/email-thread/${id}`, undefined, 'api_get_thread');
  if (!res.ok) throw new Error(`Get thread failed: ${res.status}`);
  return res.json();
}

export async function apiAppendThreadMessage(id: number, message: any, role: string = 'PIC_Operational') {
  if (OFFLINE) return mock.apiAppendThreadMessage(id, message, role);
  const res = await request(`${API_BASE}/email-thread/${id}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-role': role, 'x-user-type': (localStorage.getItem('mpsone_user_type') === 'supplier' ? 'Supplier' : 'Client') },
    body: JSON.stringify({ message }),
  }, 'api_append_thread_message');
  if (!res.ok) throw new Error(`Append message failed: ${res.status}`);
  return res.json();
}

export async function apiUpdateThreadMeta(id: number, patch: { labels?: string[]; archived?: boolean }) {
  if (OFFLINE) return mock.apiUpdateThreadMeta(id, patch);
  const res = await request(`${API_BASE}/email-thread/${id}/meta`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  }, 'api_update_thread_meta');
  if (!res.ok) throw new Error(`Update thread meta failed: ${res.status}`);
  return res.json();
}

export async function apiListThreads(params: { pr_id?: number; po_id?: number }) {
  if (OFFLINE) return mock.apiListThreads(params);
  const qs = new URLSearchParams();
  if (params.pr_id != null) qs.set('pr_id', String(params.pr_id));
  if (params.po_id != null) qs.set('po_id', String(params.po_id));
  const res = await request(`${API_BASE}/email-thread?${qs.toString()}`, undefined, 'api_list_threads');
  if (!res.ok) throw new Error(`List threads failed: ${res.status}`);
  return res.json();
}

// --- Documents upload/list
export async function apiUploadDoc(input: { type: string; refId: number | null; url: string; canAccess?: string[]; storage_provider?: string; storage_key?: string; hash_sha256?: string }, role: string = 'PIC_Operational') {
  if (OFFLINE) return mock.apiUploadDoc(input, role);
  const res = await request(`${API_BASE}/docs/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-role': role, 'x-user-type': (localStorage.getItem('mpsone_user_type') === 'supplier' ? 'Supplier' : 'Client') },
    body: JSON.stringify({
      type: input.type,
      refId: input.refId,
      url: input.url,
      canAccess: input.canAccess || ['Admin','PIC_Procurement','PIC_Operational'],
      storage_provider: input.storage_provider || 'demo',
      storage_key: input.storage_key,
      hash_sha256: input.hash_sha256,
    }),
  }, 'api_upload_doc');
  if (!res.ok) throw new Error(`Upload doc failed: ${res.status}`);
  return res.json();
}

export async function apiListDocs(params: { type?: string; refId?: number; limit?: number; offset?: number }) {
  if (OFFLINE) return mock.apiListDocs(params);
  const qs = new URLSearchParams();
  if (params.type) qs.set('type', params.type);
  if (params.refId != null) qs.set('ref_id', String(params.refId));
  if (params.limit != null) qs.set('limit', String(params.limit));
  if (params.offset != null) qs.set('offset', String(params.offset));
  const res = await request(`${API_BASE}/docs?${qs.toString()}`, undefined, 'api_list_docs');
  if (!res.ok) throw new Error(`List docs failed: ${res.status}`);
  return res.json();
}

// --- Social features: users, relationships, blocks, invites ---
export async function apiListUsers() {
  if (OFFLINE) return mock.apiListUsers();
  const res = await request(`${API_BASE}/users`, undefined, 'api_list_users');
  if (!res.ok) throw new Error(`List users failed: ${res.status}`);
  return res.json();
}

export async function apiFollowUser(followerEmail: string, followeeEmail: string) {
  if (OFFLINE) return mock.apiFollowUser(followerEmail, followeeEmail);
  const res = await request(`${API_BASE}/users/follow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ followerEmail, followeeEmail }),
  }, 'api_follow_user');
  if (!res.ok) throw new Error(`Follow failed: ${res.status}`);
  return res.json();
}

export async function apiUnfollowUser(followerEmail: string, followeeEmail: string) {
  if (OFFLINE) return mock.apiUnfollowUser(followerEmail, followeeEmail);
  const res = await request(`${API_BASE}/users/unfollow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ followerEmail, followeeEmail }),
  }, 'api_unfollow_user');
  if (!res.ok) throw new Error(`Unfollow failed: ${res.status}`);
  return res.json();
}

export async function apiBlockUser(blockerEmail: string, blockedEmail: string) {
  if (OFFLINE) return mock.apiBlockUser(blockerEmail, blockedEmail);
  const res = await request(`${API_BASE}/users/block`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blockerEmail, blockedEmail }),
  }, 'api_block_user');
  if (!res.ok) throw new Error(`Block failed: ${res.status}`);
  return res.json();
}

export async function apiUnblockUser(blockerEmail: string, blockedEmail: string) {
  if (OFFLINE) return mock.apiUnblockUser(blockerEmail, blockedEmail);
  const res = await request(`${API_BASE}/users/unblock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blockerEmail, blockedEmail }),
  }, 'api_unblock_user');
  if (!res.ok) throw new Error(`Unblock failed: ${res.status}`);
  return res.json();
}

export async function apiListRelationships(email: string) {
  if (OFFLINE) return mock.apiListRelationships(email);
  const res = await request(`${API_BASE}/users/${encodeURIComponent(email)}/relationships`, undefined, 'api_list_relationships');
  if (!res.ok) throw new Error(`Relationships failed: ${res.status}`);
  return res.json();
}

export async function apiListBlocks(email: string) {
  if (OFFLINE) return mock.apiListBlocks(email);
  const res = await request(`${API_BASE}/users/${encodeURIComponent(email)}/blocks`, undefined, 'api_list_blocks');
  if (!res.ok) throw new Error(`Blocks failed: ${res.status}`);
  return res.json();
}

export async function apiInviteUser(fromEmail: string, toEmail: string) {
  if (OFFLINE) return mock.apiInviteUser(fromEmail, toEmail);
  const res = await request(`${API_BASE}/users/invite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fromEmail, toEmail }),
  }, 'api_invite_user');
  if (!res.ok) throw new Error(`Invite failed: ${res.status}`);
  return res.json();
}

export async function apiIsConversationBlocked(participants: { email?: string }[]) {
  if (OFFLINE) return mock.apiIsConversationBlocked(participants);
  const res = await request(`${API_BASE}/users/conv-blocked`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ participants }),
  }, 'api_conv_blocked');
  if (!res.ok) throw new Error(`Conversation block check failed: ${res.status}`);
  return res.json();
}

export async function apiListInvites(email: string) {
  if (OFFLINE) return mock.apiListInvites(email);
  const res = await request(`${API_BASE}/users/${encodeURIComponent(email)}/invites`, undefined, 'api_list_invites');
  if (!res.ok) throw new Error(`List invites failed: ${res.status}`);
  return res.json();
}

export async function apiRespondInvite(id: string, status: 'accepted'|'declined') {
  if (OFFLINE) return mock.apiRespondInvite(id, status);
  const res = await request(`${API_BASE}/users/invites/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  }, 'api_respond_invite');
  if (!res.ok) throw new Error(`Respond invite failed: ${res.status}`);
  return res.json();
}

export async function apiCancelInvite(id: string) {
  if (OFFLINE) return mock.apiCancelInvite(id);
  const res = await request(`${API_BASE}/users/invites/${encodeURIComponent(id)}`, { method: 'DELETE' }, 'api_cancel_invite');
  if (!res.ok) throw new Error(`Cancel invite failed: ${res.status}`);
  return res.json();
}
