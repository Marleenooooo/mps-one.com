export type InviteStatus = 'active' | 'revoked' | 'used';
export type Invite = {
  id: string;
  email: string;
  role: 'PIC Operational' | 'PIC Procurement' | 'PIC Finance';
  department?: string;
  code: string;
  expiresAt: string; // ISO date
  status: InviteStatus;
  createdAt: string; // ISO date
};

function readInvites(): Invite[] {
  try {
    const raw = localStorage.getItem('mpsone_invites');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeInvites(list: Invite[]) {
  try {
    localStorage.setItem('mpsone_invites', JSON.stringify(list));
  } catch {}
}

function genCode(role: Invite['role']): string {
  const prefix = role === 'PIC Operational' ? 'CLI-OPS' : role === 'PIC Finance' ? 'CLI-FIN' : 'CLI-PROC';
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${rand}`;
}

export async function createInvite(params: { email: string; role: Invite['role']; department?: string }): Promise<{ code: string; expiresAt: string; invite: Invite }> {
  const now = new Date();
  const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const code = genCode(params.role);
  const invite: Invite = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    email: params.email,
    role: params.role,
    department: params.department,
    code,
    expiresAt: expires.toISOString(),
    status: 'active',
    createdAt: now.toISOString(),
  };
  const list = readInvites();
  list.unshift(invite);
  writeInvites(list);
  return { code, expiresAt: invite.expiresAt, invite };
}

export async function listInvites(): Promise<Invite[]> {
  const list = readInvites();
  // sort by createdAt desc
  return list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function revokeInvite(id: string): Promise<Invite | null> {
  const list = readInvites();
  const idx = list.findIndex(i => i.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], status: 'revoked' };
  writeInvites(list);
  return list[idx];
}

