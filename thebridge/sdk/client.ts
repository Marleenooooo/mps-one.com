import type { Claims, UserMode } from '../contracts/identity';
import type { VendorTrustSignal } from '../contracts/trustGraph';
import type { EventEnvelope, EventTopic } from '../events/topics';
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

  // Analytics methods
  async getFunnelData(token: string): Promise<any> {
    try {
      const res = await fetch(`${this.baseUrl}/bridge/analytics/funnel`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`funnel ${res.status}`);
      return await res.json();
    } catch {
      return {
        steps: [
          { name: 'PR Created', count: 1000, conversion: 1.0 },
          { name: 'Quotes Received', count: 850, conversion: 0.85 },
          { name: 'PO Issued', count: 680, conversion: 0.68 },
          { name: 'Delivery Confirmed', count: 612, conversion: 0.61 },
          { name: 'Invoice Paid', count: 550, conversion: 0.55 }
        ],
        period: '30d',
        totalValue: 2000000,
        avgCycleTime: '16 days'
      };
    }
  }

  async getSupplierPerformance(vendorId: string, token: string): Promise<any> {
    try {
      const res = await fetch(`${this.baseUrl}/bridge/analytics/suppliers/${encodeURIComponent(vendorId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`supplier ${res.status}`);
      return await res.json();
    } catch {
      return {
        vendorId,
        overallScore: 80,
        metrics: {
          onTimeDelivery: 0.88,
          qualityRating: 0.82,
          costCompetitiveness: 0.75,
          communication: 0.85
        },
        trends: [
          { month: '2024-01', score: 78 },
          { month: '2024-02', score: 79 },
          { month: '2024-03', score: 80 }
        ]
      };
    }
  }

  async getCohortData(token: string): Promise<any[]> {
    try {
      const res = await fetch(`${this.baseUrl}/bridge/analytics/cohorts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`cohorts ${res.status}`);
      return await res.json();
    } catch {
      return [
        {
          cohort: '2024-Q1',
          users: 200,
          retention: [100, 80, 65, 60, 55],
          avgProcurementValue: 10000,
          behavior: 'steady'
        }
      ];
    }
  }

  async getAnomalies(token: string): Promise<any[]> {
    try {
      const res = await fetch(`${this.baseUrl}/bridge/analytics/anomalies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`anomalies ${res.status}`);
      return await res.json();
    } catch {
      return [
        {
          type: 'pricing',
          severity: 'medium',
          description: 'Quote price variation detected',
          entity: { type: 'quote', id: 'QT-DEV-001' },
          detectedAt: new Date().toISOString(),
          status: 'open'
        }
      ];
    }
  }

  async getForecast(token: string): Promise<any> {
    try {
      const res = await fetch(`${this.baseUrl}/bridge/analytics/forecast`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`forecast ${res.status}`);
      return await res.json();
    } catch {
      return {
        budget: { current: 2000000, projected: 2200000, variance: 10, confidence: 0.8 },
        procurement: {
          volume: { current: 1000, projected: 1200, trend: 'increasing' },
          cycleTime: { current: 16, projected: 14, improvement: 12.5 }
        },
        recommendations: ['Monitor supplier performance', 'Optimize procurement cycles']
      };
    }
  }

  subscribeToAnalyticsEvents(topics: EventTopic[] = [], onEvent: (event: EventEnvelope) => void): () => void {
    const params = new URLSearchParams();
    topics.forEach(t => params.append('topic', t));
    const url = `${this.baseUrl}/bridge/analytics/events?${params.toString()}`;
    
    const source = new EventSource(url);
    source.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        onEvent(data as EventEnvelope);
      } catch {}
    };
    source.onerror = () => {
      // Fallback: emit synthetic events for development
      const syntheticEvents = [
        { topic: 'analytics.funnel.step', ts: Date.now(), payload: { step: 'pr_created', conversion: 0.85 }, source: 'mpsone' },
        { topic: 'supplier.performance.updated', ts: Date.now(), payload: { vendorId: 'SUP-1', score: 87 }, source: 'mpsone' }
      ];
      const randomEvent = syntheticEvents[Math.floor(Math.random() * syntheticEvents.length)];
      onEvent(randomEvent as EventEnvelope);
    };
    
    return () => source.close();
  }
}
