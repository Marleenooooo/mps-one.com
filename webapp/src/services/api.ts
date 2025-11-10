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

