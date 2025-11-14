export type PaymentMethodType = 'bank_transfer' | 'credit_card' | 'digital_wallet' | 'check' | 'cash';

export interface PaymentMethod {
  id: number;
  company_id: number;
  method_name: string;
  method_type: PaymentMethodType;
  account_number?: string;
  account_holder_name?: string;
  bank_name?: string;
  bank_code?: string;
  routing_number?: string;
  currency: string;
  is_active: boolean;
  is_default: boolean;
  processing_fee_percentage: number;
  processing_fee_fixed: number;
  daily_limit?: number;
  monthly_limit?: number;
  requires_approval: boolean;
  approval_threshold?: number;
  integration_provider?: string;
  integration_config?: any;
  created_at: string;
  updated_at: string;
}

export type PaymentRunStatus = 'draft' | 'scheduled' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type ReconciliationStatus = 'pending' | 'matched' | 'discrepancy' | 'resolved';

export interface PaymentRun {
  id: number;
  company_id: number;
  run_name: string;
  run_date: string;
  payment_method_id?: number;
  status: PaymentRunStatus;
  total_amount: number;
  total_payments: number;
  processed_payments: number;
  failed_payments: number;
  scheduled_for?: string;
  processed_at?: string;
  approved_by?: number;
  approved_at?: string;
  executed_by?: number;
  executed_at?: string;
  failure_reason?: string;
  reconciliation_status: ReconciliationStatus;
  created_at: string;
  updated_at: string;
}

export type PaymentStatus = 'pending' | 'scheduled' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'returned';

export interface Payment {
  id: number;
  payment_run_id?: number;
  invoice_id: number;
  invoice_number: string;
  vendor_id: number;
  vendor_name: string;
  payment_method_id?: number;
  payment_reference: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  scheduled_date?: string;
  processed_date?: string;
  bank_reference?: string;
  transaction_id?: string;
  processing_fee: number;
  net_amount: number;
  exchange_rate: number;
  base_currency_amount: number;
  failure_reason?: string;
  reconciliation_status: ReconciliationStatus;
  created_at: string;
  updated_at: string;
}

export interface BankStatementTransaction {
  id: number;
  bank_statement_id: number;
  transaction_date: string;
  description?: string;
  reference_number?: string;
  transaction_type: 'credit' | 'debit';
  amount: number;
  balance?: number;
  counterparty_name?: string;
  counterparty_account?: string;
  transaction_category?: string;
  matched_payment_id?: number;
  match_confidence?: number;
}

export interface BankStatement {
  id: number;
  company_id: number;
  account_id: string;
  statement_date: string;
  opening_balance: number;
  closing_balance: number;
  total_credits: number;
  total_debits: number;
  currency: string;
  file_name?: string;
  file_path?: string;
  import_status: 'pending' | 'processing' | 'completed' | 'failed';
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentStatistics {
  total_payments: number;
  total_amount: number;
  pending_payments: number;
  pending_amount: number;
  completed_payments: number;
  completed_amount: number;
  failed_payments: number;
  failed_amount: number;
}

class PaymentService {
  private methods: PaymentMethod[] = [
    {
      id: 1,
      company_id: 1,
      method_name: 'Primary Business Account',
      method_type: 'bank_transfer',
      account_number: '****1234',
      account_holder_name: 'MPSOne Supplier Co',
      bank_name: 'Bank Central',
      bank_code: 'BCTRIDJX',
      currency: 'IDR',
      is_active: true,
      is_default: true,
      processing_fee_percentage: 0,
      processing_fee_fixed: 0,
      daily_limit: 200000000,
      monthly_limit: 5000000000,
      requires_approval: true,
      approval_threshold: 100000000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  private runs: PaymentRun[] = [
    {
      id: 1,
      company_id: 1,
      run_name: 'Weekly Payment Run',
      run_date: new Date().toISOString().slice(0,10),
      payment_method_id: 1,
      status: 'completed',
      total_amount: 185000000,
      total_payments: 5,
      processed_payments: 5,
      failed_payments: 0,
      processed_at: new Date().toISOString(),
      reconciliation_status: 'matched',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      company_id: 1,
      run_name: 'Scheduled Payment Run',
      run_date: new Date(Date.now() + 86400000).toISOString().slice(0,10),
      payment_method_id: 1,
      status: 'scheduled',
      total_amount: 95000000,
      total_payments: 3,
      processed_payments: 0,
      failed_payments: 0,
      scheduled_for: new Date(Date.now() + 86400000).toISOString(),
      reconciliation_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  private payments: Payment[] = [
    {
      id: 1,
      payment_run_id: 1,
      invoice_id: 101,
      invoice_number: 'INV-2025-001',
      vendor_id: 10,
      vendor_name: 'TechCorp Solutions',
      payment_method_id: 1,
      payment_reference: 'PAY-2025-001',
      amount: 35000000,
      currency: 'IDR',
      status: 'completed',
      processed_date: new Date().toISOString().slice(0,10),
      bank_reference: 'BR-001',
      transaction_id: 'TX-001',
      processing_fee: 0,
      net_amount: 35000000,
      exchange_rate: 1,
      base_currency_amount: 35000000,
      reconciliation_status: 'matched',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      payment_run_id: 2,
      invoice_id: 102,
      invoice_number: 'INV-2025-002',
      vendor_id: 11,
      vendor_name: 'Office Supplies Inc',
      payment_method_id: 1,
      payment_reference: 'PAY-2025-002',
      amount: 15000000,
      currency: 'IDR',
      status: 'pending',
      scheduled_date: new Date(Date.now() + 86400000).toISOString().slice(0,10),
      processing_fee: 0,
      net_amount: 15000000,
      exchange_rate: 1,
      base_currency_amount: 15000000,
      reconciliation_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  private statements: BankStatement[] = [
    {
      id: 1,
      company_id: 1,
      account_id: 'ACCT-001',
      statement_date: new Date().toISOString().slice(0,10),
      opening_balance: 500000000,
      closing_balance: 600000000,
      total_credits: 150000000,
      total_debits: 50000000,
      currency: 'IDR',
      import_status: 'completed',
      processed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  private statementTx: BankStatementTransaction[] = [
    {
      id: 1,
      bank_statement_id: 1,
      transaction_date: new Date().toISOString().slice(0,10),
      description: 'Vendor payment TechCorp',
      reference_number: 'BR-001',
      transaction_type: 'debit',
      amount: 35000000,
      matched_payment_id: 1,
      match_confidence: 98.5
    },
    {
      id: 2,
      bank_statement_id: 1,
      transaction_date: new Date().toISOString().slice(0,10),
      description: 'Vendor payment Office Supplies',
      reference_number: 'BR-XXX',
      transaction_type: 'debit',
      amount: 15000000
    }
  ];

  async getPaymentMethods(companyId: number): Promise<PaymentMethod[]> {
    await new Promise(r => setTimeout(r, 200));
    return this.methods.filter(m => m.company_id === companyId);
  }

  async createPaymentMethod(pm: Partial<PaymentMethod>): Promise<PaymentMethod> {
    await new Promise(r => setTimeout(r, 200));
    const next: PaymentMethod = {
      id: this.methods.length + 1,
      company_id: pm.company_id ?? 1,
      method_name: pm.method_name ?? 'New Method',
      method_type: pm.method_type ?? 'bank_transfer',
      currency: pm.currency ?? 'IDR',
      is_active: pm.is_active ?? true,
      is_default: pm.is_default ?? false,
      processing_fee_percentage: pm.processing_fee_percentage ?? 0,
      processing_fee_fixed: pm.processing_fee_fixed ?? 0,
      requires_approval: pm.requires_approval ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.methods.push(next);
    return next;
  }

  async updatePaymentMethod(id: number, updates: Partial<PaymentMethod>): Promise<PaymentMethod | null> {
    await new Promise(r => setTimeout(r, 200));
    const pm = this.methods.find(m => m.id === id) || null;
    if (!pm) return null;
    Object.assign(pm, updates, { updated_at: new Date().toISOString() });
    return pm;
  }

  async deletePaymentMethod(id: number): Promise<boolean> {
    await new Promise(r => setTimeout(r, 150));
    const idx = this.methods.findIndex(m => m.id === id);
    if (idx === -1) return false;
    this.methods.splice(idx, 1);
    return true;
  }

  async getPaymentRuns(companyId: number): Promise<PaymentRun[]> {
    await new Promise(r => setTimeout(r, 200));
    return this.runs.filter(rn => rn.company_id === companyId);
  }

  async createPaymentRun(payload: Partial<PaymentRun>): Promise<PaymentRun> {
    await new Promise(r => setTimeout(r, 250));
    const next: PaymentRun = {
      id: this.runs.length + 1,
      company_id: payload.company_id ?? 1,
      run_name: payload.run_name ?? `Payment Run ${new Date().toISOString().slice(0,10)}`,
      run_date: payload.run_date ?? new Date().toISOString().slice(0,10),
      payment_method_id: payload.payment_method_id,
      status: 'draft',
      total_amount: 0,
      total_payments: 0,
      processed_payments: 0,
      failed_payments: 0,
      reconciliation_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.runs.push(next);
    return next;
  }

  async schedulePaymentRun(id: number, whenISO: string): Promise<PaymentRun | null> {
    await new Promise(r => setTimeout(r, 200));
    const run = this.runs.find(rn => rn.id === id) || null;
    if (!run) return null;
    run.status = 'scheduled';
    run.scheduled_for = whenISO;
    run.updated_at = new Date().toISOString();
    return run;
  }

  async approvePaymentRun(id: number, approverId: number): Promise<PaymentRun | null> {
    await new Promise(r => setTimeout(r, 200));
    const run = this.runs.find(rn => rn.id === id) || null;
    if (!run) return null;
    run.approved_by = approverId;
    run.approved_at = new Date().toISOString();
    run.status = 'processing';
    run.updated_at = new Date().toISOString();
    return run;
  }

  async executePaymentRun(id: number, executorId: number): Promise<PaymentRun | null> {
    await new Promise(r => setTimeout(r, 300));
    const run = this.runs.find(rn => rn.id === id) || null;
    if (!run) return null;
    const affected = this.payments.filter(p => p.payment_run_id === id);
    run.total_payments = affected.length;
    run.processed_payments = affected.length;
    run.total_amount = affected.reduce((s, p) => s + p.amount, 0);
    run.executed_by = executorId;
    run.executed_at = new Date().toISOString();
    run.status = 'completed';
    run.updated_at = new Date().toISOString();
    affected.forEach(p => { p.status = 'completed'; p.processed_date = new Date().toISOString().slice(0,10); p.updated_at = new Date().toISOString(); });
    return run;
  }

  async getPayments(companyId: number): Promise<Payment[]> {
    await new Promise(r => setTimeout(r, 200));
    return this.payments;
  }

  async getPaymentStatistics(companyId: number): Promise<PaymentStatistics> {
    await new Promise(r => setTimeout(r, 150));
    const list = await this.getPayments(companyId);
    return {
      total_payments: list.length,
      total_amount: list.reduce((s, p) => s + p.amount, 0),
      pending_payments: list.filter(p => p.status === 'pending' || p.status === 'scheduled').length,
      pending_amount: list.filter(p => p.status === 'pending' || p.status === 'scheduled').reduce((s, p) => s + p.amount, 0),
      completed_payments: list.filter(p => p.status === 'completed').length,
      completed_amount: list.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0),
      failed_payments: list.filter(p => p.status === 'failed').length,
      failed_amount: list.filter(p => p.status === 'failed').reduce((s, p) => s + p.amount, 0)
    };
  }

  async getBankStatements(companyId: number): Promise<BankStatement[]> {
    await new Promise(r => setTimeout(r, 150));
    return this.statements.filter(s => s.company_id === companyId);
  }

  async getBankStatementTransactions(statementId: number): Promise<BankStatementTransaction[]> {
    await new Promise(r => setTimeout(r, 150));
    return this.statementTx.filter(tx => tx.bank_statement_id === statementId);
  }

  async reconcile(paymentId: number, reference: string, amount: number): Promise<Payment | null> {
    await new Promise(r => setTimeout(r, 200));
    const p = this.payments.find(x => x.id === paymentId) || null;
    if (!p) return null;
    p.bank_reference = reference;
    p.reconciliation_status = Math.abs(p.amount - amount) < 0.01 ? 'matched' : 'discrepancy';
    p.updated_at = new Date().toISOString();
    return p;
  }
}

export const paymentService = new PaymentService();
