export type UserMode = 'Client' | 'Supplier';
export type UserRole =
  | 'Admin'
  | 'PIC Operational'
  | 'PIC Procurement'
  | 'PIC Finance'
  | 'Supplier Admin'
  | 'Supplier PIC Procurement'
  | 'Supplier PIC Finance';

export interface Claims {
  userId: string;
  companyId: string;
  role: UserRole;
  mode: UserMode;
  email?: string;
  name?: string;
  issuedAt?: string;
  expiresAt?: string;
}

export interface CompanyRef {
  id: string;
  name?: string;
}

