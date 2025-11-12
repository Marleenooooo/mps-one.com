import { API_BASE, getOfflineMode } from '../config';
import * as mock from './mock';

const OFFLINE = getOfflineMode();

export async function apiHealth() {
  if (OFFLINE) return mock.apiHealth();
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export async function apiPOSummary() {
  if (OFFLINE) return mock.apiPOSummary();
  const res = await fetch(`${API_BASE}/po/summary`);
  if (!res.ok) throw new Error(`PO summary failed: ${res.status}`);
  return res.json();
}

export async function apiInvoiceStatus() {
  if (OFFLINE) return mock.apiInvoiceStatus();
  const res = await fetch(`${API_BASE}/invoice/status`);
  if (!res.ok) throw new Error(`Invoice status failed: ${res.status}`);
  return res.json();
}

// --- PR CRUD ---
export async function apiListPR() {
  if (OFFLINE) return mock.apiListPR();
  const res = await fetch(`${API_BASE}/pr`);
  if (!res.ok) throw new Error(`List PR failed: ${res.status}`);
  return res.json();
}

export async function apiGetPR(id: number) {
  if (OFFLINE) return mock.apiGetPR(id);
  const res = await fetch(`${API_BASE}/pr/${id}`);
  if (!res.ok) throw new Error(`Get PR failed: ${res.status}`);
  return res.json();
}

export async function apiCreatePR(payload: any, role: string = 'PIC_Procurement') {
  if (OFFLINE) return mock.apiCreatePR(payload, role);
  const res = await fetch(`${API_BASE}/pr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-role': role },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let msg = `Create PR failed: ${res.status}`;
    try { const j = await res.json(); if (j?.error) msg = j.error; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function apiUpdatePR(id: number, patch: any, role: string = 'PIC_Procurement') {
  if (OFFLINE) return mock.apiUpdatePR(id, patch);
  const res = await fetch(`${API_BASE}/pr/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-role': role },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`Update PR failed: ${res.status}`);
  return res.json();
}

export async function apiDeletePR(id: number, role: string = 'Admin') {
  if (OFFLINE) return mock.apiDeletePR(id);
  const res = await fetch(`${API_BASE}/pr/${id}`, { method: 'DELETE', headers: { 'x-role': role } });
  if (!res.ok) throw new Error(`Delete PR failed: ${res.status}`);
  return res.json();
}

// --- Email Thread (send/receive)
export async function apiCreateThread(input: { participants: any[]; messages?: any[]; subject?: string; pr_id?: number; po_id?: number }, role: string = 'PIC_Procurement') {
  if (OFFLINE) return mock.apiCreateThread(input, role);
  const res = await fetch(`${API_BASE}/email-thread`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-role': role },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Create thread failed: ${res.status}`);
  return res.json();
}

export async function apiGetThread(id: number) {
  if (OFFLINE) return mock.apiGetThread(id);
  const res = await fetch(`${API_BASE}/email-thread/${id}`);
  if (!res.ok) throw new Error(`Get thread failed: ${res.status}`);
  return res.json();
}

export async function apiAppendThreadMessage(id: number, message: any, role: string = 'PIC_Operational') {
  if (OFFLINE) return mock.apiAppendThreadMessage(id, message, role);
  const res = await fetch(`${API_BASE}/email-thread/${id}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-role': role },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(`Append message failed: ${res.status}`);
  return res.json();
}

export async function apiUpdateThreadMeta(id: number, patch: { labels?: string[]; archived?: boolean }) {
  if (OFFLINE) return mock.apiUpdateThreadMeta(id, patch);
  const res = await fetch(`${API_BASE}/email-thread/${id}/meta`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`Update thread meta failed: ${res.status}`);
  return res.json();
}

export async function apiListThreads(params: { pr_id?: number; po_id?: number }) {
  if (OFFLINE) return mock.apiListThreads(params);
  const qs = new URLSearchParams();
  if (params.pr_id != null) qs.set('pr_id', String(params.pr_id));
  if (params.po_id != null) qs.set('po_id', String(params.po_id));
  const res = await fetch(`${API_BASE}/email-thread?${qs.toString()}`);
  if (!res.ok) throw new Error(`List threads failed: ${res.status}`);
  return res.json();
}

// --- Documents upload/list
export async function apiUploadDoc(input: { type: string; refId: number | null; url: string; canAccess?: string[]; storage_provider?: string; storage_key?: string; hash_sha256?: string }, role: string = 'PIC_Operational') {
  if (OFFLINE) return mock.apiUploadDoc(input, role);
  const res = await fetch(`${API_BASE}/docs/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-role': role },
    body: JSON.stringify({
      type: input.type,
      refId: input.refId,
      url: input.url,
      canAccess: input.canAccess || ['Admin','PIC_Procurement','PIC_Operational'],
      storage_provider: input.storage_provider || 'demo',
      storage_key: input.storage_key,
      hash_sha256: input.hash_sha256,
    }),
  });
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
  const res = await fetch(`${API_BASE}/docs?${qs.toString()}`);
  if (!res.ok) throw new Error(`List docs failed: ${res.status}`);
  return res.json();
}

// --- Social features: users, relationships, blocks, invites ---
export async function apiListUsers() {
  if (OFFLINE) return mock.apiListUsers();
  const res = await fetch(`${API_BASE}/users`);
  if (!res.ok) throw new Error(`List users failed: ${res.status}`);
  return res.json();
}

export async function apiFollowUser(followerEmail: string, followeeEmail: string) {
  if (OFFLINE) return mock.apiFollowUser(followerEmail, followeeEmail);
  const res = await fetch(`${API_BASE}/users/follow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ followerEmail, followeeEmail }),
  });
  if (!res.ok) throw new Error(`Follow failed: ${res.status}`);
  return res.json();
}

export async function apiUnfollowUser(followerEmail: string, followeeEmail: string) {
  if (OFFLINE) return mock.apiUnfollowUser(followerEmail, followeeEmail);
  const res = await fetch(`${API_BASE}/users/unfollow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ followerEmail, followeeEmail }),
  });
  if (!res.ok) throw new Error(`Unfollow failed: ${res.status}`);
  return res.json();
}

export async function apiBlockUser(blockerEmail: string, blockedEmail: string) {
  if (OFFLINE) return mock.apiBlockUser(blockerEmail, blockedEmail);
  const res = await fetch(`${API_BASE}/users/block`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blockerEmail, blockedEmail }),
  });
  if (!res.ok) throw new Error(`Block failed: ${res.status}`);
  return res.json();
}

export async function apiUnblockUser(blockerEmail: string, blockedEmail: string) {
  if (OFFLINE) return mock.apiUnblockUser(blockerEmail, blockedEmail);
  const res = await fetch(`${API_BASE}/users/unblock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blockerEmail, blockedEmail }),
  });
  if (!res.ok) throw new Error(`Unblock failed: ${res.status}`);
  return res.json();
}

export async function apiListRelationships(email: string) {
  if (OFFLINE) return mock.apiListRelationships(email);
  const res = await fetch(`${API_BASE}/users/${encodeURIComponent(email)}/relationships`);
  if (!res.ok) throw new Error(`Relationships failed: ${res.status}`);
  return res.json();
}

export async function apiListBlocks(email: string) {
  if (OFFLINE) return mock.apiListBlocks(email);
  const res = await fetch(`${API_BASE}/users/${encodeURIComponent(email)}/blocks`);
  if (!res.ok) throw new Error(`Blocks failed: ${res.status}`);
  return res.json();
}

export async function apiInviteUser(fromEmail: string, toEmail: string) {
  if (OFFLINE) return mock.apiInviteUser(fromEmail, toEmail);
  const res = await fetch(`${API_BASE}/users/invite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fromEmail, toEmail }),
  });
  if (!res.ok) throw new Error(`Invite failed: ${res.status}`);
  return res.json();
}

export async function apiIsConversationBlocked(participants: { email?: string }[]) {
  if (OFFLINE) return mock.apiIsConversationBlocked(participants);
  const res = await fetch(`${API_BASE}/users/conv-blocked`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ participants }),
  });
  if (!res.ok) throw new Error(`Conversation block check failed: ${res.status}`);
  return res.json();
}

export async function apiListInvites(email: string) {
  if (OFFLINE) return mock.apiListInvites(email);
  const res = await fetch(`${API_BASE}/users/${encodeURIComponent(email)}/invites`);
  if (!res.ok) throw new Error(`List invites failed: ${res.status}`);
  return res.json();
}

export async function apiRespondInvite(id: string, status: 'accepted'|'declined') {
  if (OFFLINE) return mock.apiRespondInvite(id, status);
  const res = await fetch(`${API_BASE}/users/invites/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`Respond invite failed: ${res.status}`);
  return res.json();
}

export async function apiCancelInvite(id: string) {
  if (OFFLINE) return mock.apiCancelInvite(id);
  const res = await fetch(`${API_BASE}/users/invites/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Cancel invite failed: ${res.status}`);
  return res.json();
}
