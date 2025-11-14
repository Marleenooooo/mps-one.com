export type Mode = 'Client' | 'Supplier';
export type Role =
  | 'Client Admin'
  | 'Client PIC Operational'
  | 'Client PIC Procurement'
  | 'Client PIC Finance'
  | 'Supplier Admin'
  | 'Supplier PIC Procurement'
  | 'Supplier PIC Finance';

export type Action =
  | 'switch:procurement-mode'
  | 'create:pr'
  | 'approve:pr'
  | 'reject:pr'
  | 'send:pr'
  | 'evaluate:quotes'
  | 'create:po'
  | 'confirm:delivery'
  | 'create:invoice'
  | 'mark:payment'
  | 'view:audit-logs'
  | 'create:approval-workflow'
  | 'edit:approval-workflow'
  | 'toggle:approval-workflow'
  | 'manage:departments'
  | 'manage:budgets'
  | 'manage:budget-categories'
  | 'manage:budget-thresholds'
  | 'manage:invoice-matching'
  | 'process:invoice-matching'
  | 'resolve:matching-exceptions'
  | 'manage:contracts'
  | 'manage:contract-clauses'
  | 'manage:contract-renewals'
  | 'manage:payments'
  | 'create:payment-run'
  | 'schedule:payment-run'
  | 'approve:payment-run'
  | 'execute:payment-run'
  | 'manage:payment-methods'
  | 'reconcile:payments'
  | 'manage:supplier-onboarding'
  | 'review:onboarding-application'
  | 'verify:kyc-docs'
  | 'run:compliance-checks'
  | 'score:risk';

function getMode(): Mode {
  const v = localStorage.getItem('mpsone_user_type');
  return String(v).toLowerCase() === 'supplier' ? 'Supplier' : 'Client';
}

function getRole(): Role {
  const v = localStorage.getItem('mpsone_role');
  switch (v) {
    case 'Client Admin':
    case 'Client PIC Operational':
    case 'Client PIC Procurement':
    case 'Client PIC Finance':
    case 'Supplier Admin':
    case 'Supplier PIC Procurement':
    case 'Supplier PIC Finance':
      return v as Role;
    default:
      // Default sensible role by mode
      return getMode() === 'Client' ? 'Client PIC Procurement' : 'Supplier PIC Procurement';
  }
}

// Minimal permission matrix for frontend gating
const POLICY: Record<Mode, Partial<Record<Role, Set<Action>>>> = {
  Client: {
    'Client Admin': new Set<Action>([
      'switch:procurement-mode',
      'create:pr',
      'approve:pr',
      'reject:pr',
      'send:pr',
      'evaluate:quotes',
      'create:po',
      'confirm:delivery',
      'mark:payment',
      'view:audit-logs',
      'create:approval-workflow',
      'edit:approval-workflow',
      'toggle:approval-workflow',
      'manage:departments',
      'manage:budgets',
      'manage:budget-categories',
      'manage:budget-thresholds',
      'manage:invoice-matching',
      'process:invoice-matching',
      'resolve:matching-exceptions',
      'manage:contracts',
      'manage:contract-clauses',
      'manage:contract-renewals',
      'manage:payments',
      'create:payment-run',
      'schedule:payment-run',
      'approve:payment-run',
      'execute:payment-run',
      'manage:payment-methods',
      'reconcile:payments',
    ]),
    'Client PIC Operational': new Set<Action>([
      'create:pr',
      'send:pr',
      'confirm:delivery',
    ]),
    'Client PIC Procurement': new Set<Action>([
      'create:pr',
      'approve:pr',
      'reject:pr',
      'send:pr',
      'evaluate:quotes',
      'create:po',
      'confirm:delivery',
    ]),
    'Client PIC Finance': new Set<Action>([
      'mark:payment',
      'view:audit-logs',
      'reconcile:payments',
    ]),
  },
  Supplier: {
    'Supplier Admin': new Set<Action>([
      'switch:procurement-mode',
      'create:invoice',
      'view:audit-logs',
      'create:approval-workflow',
      'edit:approval-workflow',
      'toggle:approval-workflow',
      'manage:departments',
      'manage:budgets',
      'manage:budget-categories',
      'manage:budget-thresholds',
      'manage:payments',
      'create:payment-run',
      'schedule:payment-run',
      'approve:payment-run',
      'execute:payment-run',
      'manage:payment-methods',
      'reconcile:payments',
      'manage:supplier-onboarding',
      'review:onboarding-application',
      'verify:kyc-docs',
      'run:compliance-checks',
      'score:risk',
    ]),
    'Supplier PIC Procurement': new Set<Action>([
      'evaluate:quotes', // quote builder actions
      'create:invoice',
      'confirm:delivery',
    ]),
    'Supplier PIC Finance': new Set<Action>([
      'create:invoice',
      'mark:payment',
      'reconcile:payments',
    ]),
  },
};

export function canPerform(action: Action): boolean {
  const mode = getMode();
  const role = getRole();
  const set = POLICY[mode][role];
  return set ? set.has(action) : false;
}

export function currentContext() {
  return { mode: getMode(), role: getRole() };
}
