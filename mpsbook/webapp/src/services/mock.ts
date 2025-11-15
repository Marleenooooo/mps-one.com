// Minimal local storage-backed mock for posts/users/messages

const POSTS_KEY = 'mpsbook_posts';
const USERS_KEY = 'mpsbook_users';
const MSG_KEY = 'mpsbook_messages';

export type User = { id: string; name: string; headline?: string; avatar?: string; badges?: { key: string; label?: string }[] };
export type Post = { id: string; authorId: string; content: string; createdAt: number; likes: number; comments: number };
export type Message = { id: string; fromId: string; toId: string; text: string; createdAt: number };

function ensureSeed() {
  try {
    if (!localStorage.getItem(USERS_KEY)) {
      const users: User[] = [
        { id: 'u1', name: 'Alex Chen', headline: 'Procurement Lead @ ACME', badges: [{ key: 'verified', label: 'Verified' }] },
        { id: 'u2', name: 'Nadia Rahma', headline: 'Supplier Relations @ Berkah', badges: [{ key: 'compliance', label: 'Compliance+' }] },
        { id: 'u3', name: 'Diego Martínez', headline: 'Logistics Manager @ MPS' },
      ];
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    if (!localStorage.getItem(POSTS_KEY)) {
      const posts: Post[] = [
        { id: 'p1', authorId: 'u1', content: 'Kicked off a new supplier evaluation with focus on lead-time reliability.', createdAt: Date.now() - 3600_000, likes: 24, comments: 6 },
        { id: 'p2', authorId: 'u2', content: 'Shared RFQ tips for vendors: clarity on specs saves cycles.', createdAt: Date.now() - 7200_000, likes: 12, comments: 3 },
        { id: 'p3', authorId: 'u3', content: 'Route optimization lowered delivery times by 18% this quarter.', createdAt: Date.now() - 5400_000, likes: 42, comments: 9 },
      ];
      localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    }
    if (!localStorage.getItem(MSG_KEY)) {
      const msgs: Message[] = [
        { id: 'm1', fromId: 'u2', toId: 'u1', text: 'Can we review last quarter delivery metrics?', createdAt: Date.now() - 1800_000 },
        { id: 'm2', fromId: 'u1', toId: 'u2', text: 'Sure, I will share a summary.', createdAt: Date.now() - 1500_000 },
      ];
      localStorage.setItem(MSG_KEY, JSON.stringify(msgs));
    }
  } catch {}
}

export function listUsers(): User[] {
  ensureSeed();
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch { return []; }
}
export function listPosts(): Post[] {
  ensureSeed();
  try { return JSON.parse(localStorage.getItem(POSTS_KEY) || '[]'); } catch { return []; }
}
export function addPost(post: Post) {
  ensureSeed();
  try {
    const arr: Post[] = JSON.parse(localStorage.getItem(POSTS_KEY) || '[]') || [];
    arr.unshift(post);
    localStorage.setItem(POSTS_KEY, JSON.stringify(arr));
  } catch {}
}
export function listMessages(forUserId: string): Message[] {
  ensureSeed();
  try { return (JSON.parse(localStorage.getItem(MSG_KEY) || '[]') || []).filter((m: Message) => m.toId === forUserId || m.fromId === forUserId); } catch { return []; }
}

