import React, { createContext, useContext, useEffect, useState } from 'react';

type Toast = { id: number; message: string; type?: 'info' | 'success' | 'error' };
type ToastContextValue = { push: (t: Omit<Toast, 'id'>) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  function push(t: Omit<Toast, 'id'>) {
    setToasts(prev => [...prev, { id: Date.now(), ...t }]);
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