export type PaymentStatus = 'pending' | 'scheduled' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type ReconciliationStatus = 'unmatched' | 'matched' | 'exception';
export type PaymentMethodType = 'bank_transfer' | 'virtual_account' | 'e_wallet' | 'credit_card' | 'check';

export interface PaymentRun {
  id: number;
  company_id: number;
  run_name: string;
  run_date: string;
  status: 'draft' | 'scheduled' | 'processing' | 'completed' | 'failed';
  total_payments: number;
  total_amount: number;
  currency: string;
  scheduled_at?: string | null;
  executed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  payment_run_id: number;
  company_id: number;
  payment_reference: string;
  invoice_number: string;
  vendor_id: number;
  vendor_name: string;
  amount: number;
  currency: string;
  payment_date: string;
  status: PaymentStatus;
  reconciliation_status: ReconciliationStatus;
  bank_account?: string | null;
  payment_method_id?: number | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: number;
  company_id: number;
  method_name: string;
  method_type: PaymentMethodType;
  currency: string;
  is_active: boolean;
  is_default: boolean;
  bank_name?: string | null;
  account_number?: string | null;
  account_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BankStatement {
  id: number;
  company_id: number;
  bank_account: string;
  statement_date: string;
  opening_balance: number;
  closing_balance: number;
  currency: string;
  file_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BankStatementTransaction {
  id: number;
  statement_id: number;
  transaction_date: string;
  description: string;
  amount: number;
  reference_number?: string | null;
  transaction_type: 'debit' | 'credit';
  created_at: string;
  updated_at: string;
}

const PRKEY = 'mpsone_payment_runs';
const PAYKEY = 'mpsone_payments';
const METHKEY = 'mpsone_payment_methods';
const STMTKEY = 'mpsone_bank_statements';
const TXNKEY = 'mpsone_bank_transactions';

function load<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}
function save<T>(key: string, rows: T[]) {
  try { localStorage.setItem(key, JSON.stringify(rows)); } catch {}
}
function now() {
  return new Date().toISOString();
}

function ensureSeed() {
  const runs = load<PaymentRun>(PRKEY);
  if (runs.length === 0) {
    const seed: PaymentRun[] = [
      { id: 1, company_id: 1, run_name: 'Weekly Supplier Payments', run_date: '2025-11-14', status: 'draft', total_payments: 5, total_amount: 125000, currency: 'IDR', created_at: now(), updated_at: now() },
      { id: 2, company_id: 1, run_name: 'Monthly Utilities', run_date: '2025-11-15', status: 'scheduled', total_payments: 3, total_amount: 45000, currency: 'IDR', scheduled_at: '2025-11-15T09:00:00Z', created_at: now(), updated_at: now() },
    ];
    save(PRKEY, seed);
  }
  const methods = load<PaymentMethod>(METHKEY);
  if (methods.length === 0) {
    const seedM: PaymentMethod[] = [
      { id: 1, company_id: 1, method_name: 'BCA Corporate', method_type: 'bank_transfer', currency: 'IDR', is_active: true, is_default: true, bank_name: 'BCA', account_number: '1234567890', account_name: 'PT MPSOne Indonesia', created_at: now(), updated_at: now() },
      { id: 2, company_id: 1, method_name: 'Mandiri Virtual Account', method_type: 'virtual_account', currency: 'IDR', is_active: true, is_default: false, bank_name: 'Mandiri', account_number: '9876543210', account_name: 'PT MPSOne Indonesia', created_at: now(), updated_at: now() },
    ];
    save(METHKEY, seedM);
  }
  const payments = load<Payment>(PAYKEY);
  if (payments.length === 0) {
    const seedP: Payment[] = [
      { id: 1, payment_run_id: 1, company_id: 1, payment_reference: 'PAY-2025-0001', invoice_number: 'INV-2025-1001', vendor_id: 101, vendor_name: 'Borneo Equipment Ltd', amount: 25000, currency: 'IDR', payment_date: '2025-11-14', status: 'pending', reconciliation_status: 'unmatched', created_at: now(), updated_at: now() },
      { id: 2, payment_run_id: 1, company_id: 1, payment_reference: 'PAY-2025-0002', invoice_number: 'INV-2025-1002', vendor_id: 102, vendor_name: 'Kalimantan Energy Co', amount: 35000, currency: 'IDR', payment_date: '2025-11-14', status: 'pending', reconciliation_status: 'unmatched', created_at: now(), updated_at: now() },
    ];
    save(PAYKEY, seedP);
  }
  const statements = load<BankStatement>(STMTKEY);
  if (statements.length === 0) {
    const seedS: BankStatement[] = [
      { id: 1, company_id: 1, bank_account: '1234567890', statement_date: '2025-11-13', opening_balance: 1000000, closing_balance: 1125000, currency: 'IDR', file_name: 'statement_2025_11_13.pdf', created_at: now(), updated_at: now() },
    ];
    save(STMTKEY, seedS);
    const seedT: BankStatementTransaction[] = [
      { id: 1, statement_id: 1, transaction_date: '2025-11-13', description: 'Payment from Customer ABC', amount: 25000, reference_number: 'REF-ABC-001', transaction_type: 'credit', created_at: now(), updated_at: now() },
      { id: 2, statement_id: 1, transaction_date: '2025-11-13', description: 'Payment to Supplier XYZ', amount: 15000, reference_number: 'REF-XYZ-001', transaction_type: 'debit', created_at: now(), updated_at: now() },
    ];
    save(TXNKEY, seedT);
  }
}

export const paymentService = {
  async getPaymentRuns(companyId: number): Promise<PaymentRun[]> {
    ensureSeed();
    return load<PaymentRun>(PRKEY).filter(r => r.company_id === companyId);
  },
  async createPaymentRun(run: Partial<PaymentRun>): Promise<PaymentRun> {
    const runs = load<PaymentRun>(PRKEY);
    const id = (runs[runs.length - 1]?.id || 0) + 1;
    const row: PaymentRun = {
      id,
      company_id: run.company_id || 1,
      run_name: run.run_name || 'New Payment Run',
      run_date: run.run_date || now().split('T')[0],
      status: 'draft',
      total_payments: run.total_payments || 0,
      total_amount: run.total_amount || 0,
      currency: run.currency || 'IDR',
      created_at: now(),
      updated_at: now(),
    };
    runs.push(row);
    save(PRKEY, runs);
    return row;
  },
  async schedulePaymentRun(id: number, userId: number): Promise<PaymentRun | null> {
    const runs = load<PaymentRun>(PRKEY);
    const idx = runs.findIndex(r => r.id === id);
    if (idx === -1) return null;
    runs[idx] = { ...runs[idx], status: 'scheduled', scheduled_at: now(), updated_at: now() };
    save(PRKEY, runs);
    return runs[idx];
  },
  async approvePaymentRun(id: number, userId: number): Promise<PaymentRun | null> {
    const runs = load<PaymentRun>(PRKEY);
    const idx = runs.findIndex(r => r.id === id);
    if (idx === -1) return null;
    runs[idx] = { ...runs[idx], status: 'processing', updated_at: now() };
    save(PRKEY, runs);
    return runs[idx];
  },
  async executePaymentRun(id: number, userId: number): Promise<PaymentRun | null> {
    const runs = load<PaymentRun>(PRKEY);
    const idx = runs.findIndex(r => r.id === id);
    if (idx === -1) return null;
    runs[idx] = { ...runs[idx], status: 'completed', executed_at: now(), updated_at: now() };
    save(PRKEY, runs);
    return runs[idx];
  },
  async getPayments(companyId: number): Promise<Payment[]> {
    ensureSeed();
    return load<Payment>(PAYKEY).filter(p => p.company_id === companyId);
  },
  async getPaymentMethods(companyId: number): Promise<PaymentMethod[]> {
    ensureSeed();
    return load<PaymentMethod>(METHKEY).filter(m => m.company_id === companyId);
  },
  async togglePaymentMethod(id: number): Promise<PaymentMethod | null> {
    const methods = load<PaymentMethod>(METHKEY);
    const idx = methods.findIndex(m => m.id === id);
    if (idx === -1) return null;
    methods[idx] = { ...methods[idx], is_active: !methods[idx].is_active, updated_at: now() };
    save(METHKEY, methods);
    return methods[idx];
  },
  async deletePaymentMethod(id: number): Promise<boolean> {
    const methods = load<PaymentMethod>(METHKEY);
    const filtered = methods.filter(m => m.id !== id);
    if (filtered.length === methods.length) return false;
    save(METHKEY, filtered);
    return true;
  },
  async getBankStatements(companyId: number): Promise<BankStatement[]> {
    ensureSeed();
    return load<BankStatement>(STMTKEY).filter(s => s.company_id === companyId);
  },
  async getBankTransactions(statementId: number): Promise<BankStatementTransaction[]> {
    return load<BankStatementTransaction>(TXNKEY).filter(t => t.statement_id === statementId);
  },
  async reconcile(paymentId: number, reference: string, amount: number): Promise<Payment | null> {
    const payments = load<Payment>(PAYKEY);
    const idx = payments.findIndex(p => p.id === paymentId);
    if (idx === -1) return null;
    payments[idx] = { ...payments[idx], reconciliation_status: 'matched', updated_at: now() };
    save(PAYKEY, payments);
    return payments[idx];
  },
};