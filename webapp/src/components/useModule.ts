import { useEffect, useMemo } from 'react';

export type Module = string;

export function useModule(module?: Module) {
  useEffect(() => {
    if (!module) return;
    const prev = document.documentElement.getAttribute('data-module');
    document.documentElement.setAttribute('data-module', module);
    return () => {
      if (prev) document.documentElement.setAttribute('data-module', prev);
      else document.documentElement.removeAttribute('data-module');
    };
  }, [module]);

  const api = useMemo(() => ({
    module: module || 'default',
    hasModule: (_m?: string) => true,
  }), [module]);

  return api;
}
