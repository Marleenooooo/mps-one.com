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
export async function apiCreateThread(input: { participants: any[]; messages?: any[] }, role: string = 'PIC_Procurement') {
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

export async function apiListThreads(params: { pr_id?: number; po_id?: number }) {
  if (OFFLINE) return mock.apiListThreads(params);
  const qs = new URLSearchParams();
  if (params.pr_id != null) qs.set('pr_id', String(params.pr_id));
  if (params.po_id != null) qs.set('po_id', String(params.po_id));
  const res = await fetch(`${API_BASE}/email-thread?${qs.toString()}`);
  if (!res.ok) throw new Error(`List threads failed: ${res.status}`);
  return res.json();
}
