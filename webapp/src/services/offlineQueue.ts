// Lightweight client-side offline queue for docs/messages reconciliation
// Stores items in localStorage and flushes when back online and not in mock mode

import { getOfflineMode } from '../config';
import { apiAppendThreadMessage, apiListDocs, apiUploadDoc } from './api';

export type QueueItem =
  | { type: 'uploadDoc'; payload: { type: string; refId: number | null; url: string; canAccess?: string[]; storage_provider?: string; storage_key?: string; hash_sha256?: string } }
  | { type: 'appendMessage'; payload: { threadId: number; message: any; role?: string; idempotencyKey?: string } };

type Listener = (stats: { pending: number }) => void;

const KEY = 'mpsone_offline_queue';
let listeners: Listener[] = [];

function read(): QueueItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function write(items: QueueItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {}
  notify();
}

function notify() {
  const stats = { pending: read().length };
  listeners.forEach((fn) => {
    try { fn(stats); } catch {}
  });
}

export function subscribe(listener: Listener) {
  listeners.push(listener);
  listener({ pending: read().length });
  return () => { listeners = listeners.filter((l) => l !== listener); };
}

export function enqueue(item: QueueItem) {
  const items = read();
  items.push(item);
  write(items);
}

export function getQueue(): QueueItem[] {
  return read();
}

export function clearQueue() {
  write([]);
}

function effectivelyOnline(): boolean {
  return navigator.onLine && !getOfflineMode();
}

async function processUploadDoc(item: Extract<QueueItem, { type: 'uploadDoc' }>) {
  const { payload } = item;
  // Idempotency: skip if doc with same hash exists for the same ref
  if (payload.hash_sha256 && payload.refId != null) {
    try {
      const list = await apiListDocs({ type: payload.type, refId: payload.refId, limit: 200 });
      const exists = Array.isArray(list?.rows) && list.rows.some((d: any) => d.hash_sha256 === payload.hash_sha256);
      if (exists) return true;
    } catch {}
  }
  try {
    await apiUploadDoc(payload);
    return true;
  } catch {
    return false;
  }
}

async function processAppendMessage(item: Extract<QueueItem, { type: 'appendMessage' }>) {
  const { payload } = item;
  try {
    await apiAppendThreadMessage(payload.threadId, payload.message, payload.role || 'PIC_Operational');
    return true;
  } catch {
    return false;
  }
}

export async function flushOnce(): Promise<{ processed: number; remaining: number }> {
  if (!effectivelyOnline()) return { processed: 0, remaining: read().length };
  const items = read();
  let processed = 0;
  const remaining: QueueItem[] = [];
  for (const it of items) {
    let ok = false;
    if (it.type === 'uploadDoc') ok = await processUploadDoc(it);
    else if (it.type === 'appendMessage') ok = await processAppendMessage(it);
    if (ok) processed += 1; else remaining.push(it);
  }
  write(remaining);
  return { processed, remaining: remaining.length };
}

let initialized = false;
export function initQueueAutoFlush() {
  if (initialized) return;
  initialized = true;
  const tryFlush = () => { flushOnce().catch(() => {}); };
  window.addEventListener('online', tryFlush);
  // Attempt periodic flush while online
  setInterval(() => { if (effectivelyOnline()) tryFlush(); }, 5000);
  // Kick off once on load
  tryFlush();
}

