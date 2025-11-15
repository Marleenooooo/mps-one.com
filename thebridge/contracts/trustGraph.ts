export interface TrustBadge {
  key: string;
  label?: string;
}

export interface TrustSource {
  source: 'mpsbook' | 'external';
  ref?: string;
  updatedAt?: string;
}

export interface VendorTrustSignal {
  vendorId: string;
  score: number;
  badges: TrustBadge[];
  sources?: TrustSource[];
}

export interface ReputationSummary {
  vendorId: string;
  score: number;
  updatedAt?: string;
}

