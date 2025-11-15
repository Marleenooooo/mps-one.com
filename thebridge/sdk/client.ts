import type { Claims, UserMode } from '../contracts/identity';
import type { VendorTrustSignal } from '../contracts/trustGraph';

export class BridgeClient {
  readonly baseUrl: string;
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async getClaims(token: string): Promise<Claims> {
    const res = await fetch(`${this.baseUrl}/bridge/claims`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`claims ${res.status}`);
    return res.json();
  }

  async getVendorTrust(companyId: string, token: string): Promise<VendorTrustSignal[]> {
    const res = await fetch(`${this.baseUrl}/bridge/trust/${encodeURIComponent(companyId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`trust ${res.status}`);
    return res.json();
  }

  async setMode(mode: UserMode): Promise<void> {
    const val = mode === 'Supplier' ? 'supplier' : 'client';
    if (typeof localStorage !== 'undefined') localStorage.setItem('mpsone_user_type', val);
  }
}

