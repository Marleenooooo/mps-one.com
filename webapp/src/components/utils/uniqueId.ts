export function uniqueId(prefix?: string): string {
  const hasCrypto = typeof crypto !== 'undefined' && 'randomUUID' in crypto;
  const core = hasCrypto ? (crypto as any).randomUUID() : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  return prefix ? `${prefix}-${core}` : core;
}

