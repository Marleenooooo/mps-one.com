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
  | 'view:audit-logs';

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
    ]),
  },
  Supplier: {
    'Supplier Admin': new Set<Action>([
      'switch:procurement-mode',
      'create:invoice',
    ]),
    'Supplier PIC Procurement': new Set<Action>([
      'evaluate:quotes', // quote builder actions
      'create:invoice',
      'confirm:delivery',
    ]),
    'Supplier PIC Finance': new Set<Action>([
      'create:invoice',
      'mark:payment',
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
