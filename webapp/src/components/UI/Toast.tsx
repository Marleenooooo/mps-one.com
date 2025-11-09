import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { uniqueId } from '../utils/uniqueId';

type Toast = { id: string; message: string; type?: 'info' | 'success' | 'error', tag?: string };
type ToastContextValue = { push: (t: Omit<Toast, 'id'>) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const lastByTagRef = useRef<Record<string, number>>({});
  function push(t: Omit<Toast, 'id'>) {
    // Throttle autosave toasts across the app to reduce noise
    if (t.tag === 'autosave') {
      const now = Date.now();
      const last = lastByTagRef.current['autosave'] || 0;
      if (now - last < 10000) return; // 10s throttle window
      lastByTagRef.current['autosave'] = now;
    }
    setToasts(prev => [...prev, { id: uniqueId('toast'), ...t }]);
  }
  useEffect(() => {
    const tid = setInterval(() => {
      setToasts(prev => prev.filter((t, i) => i < prev.length - 1));
    }, 4000);
    return () => clearInterval(tid);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div aria-live="polite" style={{ position: 'fixed', bottom: 20, right: 20, display: 'grid', gap: 8 }}>
        {toasts.map(t => (
          <div key={t.id} className="card" style={{ padding: 10, borderLeft: `4px solid ${t.type === 'error' ? '#DC2626' : t.type === 'success' ? '#22C55E' : 'var(--accent)'}` }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
