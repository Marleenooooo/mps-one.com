import { useEffect } from 'react';

export type Module = 'procurement' | 'finance' | 'inventory' | 'reports' | 'alerts';

/**
 * Sets `data-module` on the document root so Neon theme can map accents.
 * Safe for all themes; ignored where not used.
 */
export function useModule(module: Module) {
  useEffect(() => {
    const prev = document.documentElement.getAttribute('data-module');
    document.documentElement.setAttribute('data-module', module);
    return () => {
      // Restore previous value on unmount to avoid leaking module state across routes
      if (prev) document.documentElement.setAttribute('data-module', prev);
      else document.documentElement.removeAttribute('data-module');
    };
  }, [module]);
}