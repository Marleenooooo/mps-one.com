import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export type Pillar = 'procurement' | 'social' | 'other';

type PillarContextValue = {
  pillar: Pillar;
};

const PillarContext = createContext<PillarContextValue>({ pillar: 'other' });

function derivePillar(pathname: string): Pillar {
  try {
    const p = pathname || '/';
    if (p.startsWith('/procurement') || p.startsWith('/inventory') || p.startsWith('/supply') || p.startsWith('/supplier') || p.startsWith('/client')) {
      return 'procurement';
    }
    if (p.startsWith('/comms') || p.startsWith('/people') || p.startsWith('/admin/people')) {
      return 'social';
    }
    return 'other';
  } catch {
    return 'other';
  }
}

export function PillarProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const pillar = useMemo(() => derivePillar(location.pathname), [location.pathname]);

  useEffect(() => {
    try {
      const el = document.documentElement;
      el.setAttribute('data-pillar', pillar);
    } catch {}
  }, [pillar]);

  const value = useMemo(() => ({ pillar }), [pillar]);
  return (
    <PillarContext.Provider value={value}>{children}</PillarContext.Provider>
  );
}

export function usePillar(): PillarContextValue {
  return useContext(PillarContext);
}

