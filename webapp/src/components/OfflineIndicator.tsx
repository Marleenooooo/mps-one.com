import React, { useEffect, useState } from 'react';

export function OfflineIndicator() {
  const [online, setOnline] = useState<boolean>(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  if (online) return null;
  return (
    <div role="status" aria-live="assertive" style={{ position: 'fixed', top: 0, left: 0, right: 0, background: '#F59E0B', color: '#1f2937', padding: 8, textAlign: 'center', zIndex: 1000 }}>
      You are offline. Changes will be saved locally.
    </div>
  );
}