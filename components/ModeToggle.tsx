"use client";
import Button from './ui/Button';
import { useEffect, useState } from 'react';

type AppMode = 'social' | 'procurement';

function applyMode(mode: AppMode) {
  if (typeof document !== 'undefined') {
    document.body.dataset.appMode = mode;
  }
}

export default function ModeToggle() {
  const [mode, setMode] = useState<AppMode>('social');

  useEffect(() => {
    const saved = (typeof window !== 'undefined' && (window.localStorage.getItem('app-mode') as AppMode)) || 'social';
    setMode(saved);
    applyMode(saved);
  }, []);

  function toggle() {
    // If switching into procurement, redirect to external site per request
    if (mode === 'social') {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('app-mode', 'procurement');
        applyMode('procurement');
        window.location.href = 'https://mps-one.com';
      }
      return;
    }
    // Otherwise switch back to social within this app
    setMode('social');
    if (typeof window !== 'undefined') window.localStorage.setItem('app-mode', 'social');
    applyMode('social');
  }

  const label = mode === 'procurement' ? 'Switch to Social' : 'Procurement Mode';

  return (
    <Button variant="outline" onClick={toggle} aria-label="Toggle procurement mode">
      {label}
    </Button>
  );
}
