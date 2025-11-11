import { API_BASE } from '../config';

export async function apiHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export async function apiPOSummary() {
  const res = await fetch(`${API_BASE}/po/summary`);
  if (!res.ok) throw new Error(`PO summary failed: ${res.status}`);
  return res.json();
}

export async function apiInvoiceStatus() {
  const res = await fetch(`${API_BASE}/invoice/status`);
  if (!res.ok) throw new Error(`Invoice status failed: ${res.status}`);
  return res.json();
}

// --- PR CRUD ---
export async function apiListPR() {
  const res = await fetch(`${API_BASE}/pr`);
  if (!res.ok) throw new Error(`List PR failed: ${res.status}`);
  return res.json();
}

export async function apiGetPR(id: number) {
  const res = await fetch(`${API_BASE}/pr/${id}`);
  if (!res.ok) throw new Error(`Get PR failed: ${res.status}`);
  return res.json();
}

export async function apiCreatePR(payload: any, role: string = 'PIC_Procurement') {
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
  const res = await fetch(`${API_BASE}/pr/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-role': role },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`Update PR failed: ${res.status}`);
  return res.json();
}

export async function apiDeletePR(id: number, role: string = 'Admin') {
  const res = await fetch(`${API_BASE}/pr/${id}`, { method: 'DELETE', headers: { 'x-role': role } });
  if (!res.ok) throw new Error(`Delete PR failed: ${res.status}`);
  return res.json();
}

// --- Email Thread (send/receive)
export async function apiCreateThread(input: { participants: any[]; messages?: any[] }, role: string = 'PIC_Procurement') {
  const res = await fetch(`${API_BASE}/email-thread`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-role': role },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Create thread failed: ${res.status}`);
  return res.json();
}

export async function apiGetThread(id: number) {
  const res = await fetch(`${API_BASE}/email-thread/${id}`);
  if (!res.ok) throw new Error(`Get thread failed: ${res.status}`);
  return res.json();
}

export async function apiAppendThreadMessage(id: number, message: any, role: string = 'PIC_Operational') {
  const res = await fetch(`${API_BASE}/email-thread/${id}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-role': role },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(`Append message failed: ${res.status}`);
  return res.json();
}

export async function apiListThreads(params: { pr_id?: number; po_id?: number }) {
  const qs = new URLSearchParams();
  if (params.pr_id != null) qs.set('pr_id', String(params.pr_id));
  if (params.po_id != null) qs.set('po_id', String(params.po_id));
  const res = await fetch(`${API_BASE}/email-thread?${qs.toString()}`);
  if (!res.ok) throw new Error(`List threads failed: ${res.status}`);
  return res.json();
}
