import type { Claims, UserMode } from '../contracts/identity';
import type { VendorTrustSignal } from '../contracts/trustGraph';
import { getClaims as getStoredClaims, setClaims as setStoredClaims } from '../auth/session';

export class BridgeClient {
  readonly baseUrl: string;
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async getClaims(token: string): Promise<Claims> {
    // Prefer backend when available
    try {
      const res = await fetch(`${this.baseUrl}/bridge/claims`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`claims ${res.status}`);
      const data = await res.json();
      setStoredClaims(data);
      return data as Claims;
    } catch {
      const local = getStoredClaims();
      if (local) return local;
      // Minimal fallback claims for dev
      const dev: Claims = {
        userId: 'DEV-USER',
        companyId: 'DEV-COMPANY',
        role: 'Admin',
        mode: 'Client',
        issuedAt: new Date().toISOString(),
      } as Claims;
      setStoredClaims(dev);
      return dev;
    }
  }

  async getVendorTrust(companyId: string, token: string): Promise<VendorTrustSignal[]> {
    try {
      const res = await fetch(`${this.baseUrl}/bridge/trust/${encodeURIComponent(companyId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`trust ${res.status}`);
      return await res.json();
    } catch {
      // Fallback to local seed
      try {
        const raw = localStorage.getItem(`mpsbook_trust_${companyId}`) || '[]';
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) return arr as VendorTrustSignal[];
      } catch {}
      return [];
    }
  }

  async setMode(mode: UserMode): Promise<void> {
    const val = mode === 'Supplier' ? 'supplier' : 'client';
    if (typeof localStorage !== 'undefined') localStorage.setItem('mpsone_user_type', val);
  }
}
