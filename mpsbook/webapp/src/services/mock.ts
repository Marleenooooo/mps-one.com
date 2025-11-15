// Minimal local storage-backed mock for posts/users/messages

const POSTS_KEY = 'mpsbook_posts';
const USERS_KEY = 'mpsbook_users';
const MSG_KEY = 'mpsbook_messages';
const COMMENTS_KEY = 'mpsbook_comments';
const CONN_KEY = 'mpsbook_connections';

export type User = { id: string; name: string; headline?: string; avatar?: string; badges?: { key: string; label?: string }[] };
export type Post = { id: string; authorId: string; content: string; createdAt: number; likes: number; comments: number };
export type Message = { id: string; fromId: string; toId: string; text: string; createdAt: number };
export type Comment = { id: string; postId: string; authorId: string; text: string; createdAt: number };

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
    if (!localStorage.getItem(COMMENTS_KEY)) {
      const comments: Comment[] = [];
      localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
    }
    if (!localStorage.getItem(CONN_KEY)) {
      const connections = { followers: {}, following: {} } as { followers: Record<string,string[]>; following: Record<string,string[]> };
      connections.following['u1'] = ['u2'];
      connections.followers['u2'] = ['u1'];
      localStorage.setItem(CONN_KEY, JSON.stringify(connections));
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
export function addLike(postId: string) {
  ensureSeed();
  try {
    const arr: Post[] = JSON.parse(localStorage.getItem(POSTS_KEY) || '[]') || [];
    const idx = arr.findIndex(p => p.id === postId);
    if (idx !== -1) {
      arr[idx].likes = Number(arr[idx].likes || 0) + 1;
      localStorage.setItem(POSTS_KEY, JSON.stringify(arr));
    }
  } catch {}
}
export function listComments(postId: string): Comment[] {
  ensureSeed();
  try {
    const all: Comment[] = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]') || [];
    return all.filter(c => c.postId === postId);
  } catch { return []; }
}
export function addComment(comment: Comment) {
  ensureSeed();
  try {
    const all: Comment[] = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]') || [];
    all.push(comment);
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(all));
    const posts: Post[] = JSON.parse(localStorage.getItem(POSTS_KEY) || '[]') || [];
    const idx = posts.findIndex(p => p.id === comment.postId);
    if (idx !== -1) {
      posts[idx].comments = Number(posts[idx].comments || 0) + 1;
      localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    }
  } catch {}
}
export function listFollowers(userId: string): string[] {
  ensureSeed();
  try {
    const conn = JSON.parse(localStorage.getItem(CONN_KEY) || '{}') as { followers: Record<string,string[]> };
    return (conn.followers && conn.followers[userId]) ? conn.followers[userId] : [];
  } catch { return []; }
}
export function listFollowing(userId: string): string[] {
  ensureSeed();
  try {
    const conn = JSON.parse(localStorage.getItem(CONN_KEY) || '{}') as { following: Record<string,string[]> };
    return (conn.following && conn.following[userId]) ? conn.following[userId] : [];
  } catch { return []; }
}
export function isFollowing(meId: string, targetId: string): boolean {
  return listFollowing(meId).includes(targetId);
}
export function followUser(meId: string, targetId: string) {
  ensureSeed();
  try {
    const conn = JSON.parse(localStorage.getItem(CONN_KEY) || '{}') as { followers: Record<string,string[]>; following: Record<string,string[]> };
    const following = conn.following[meId] || [];
    if (!following.includes(targetId)) following.push(targetId);
    conn.following[meId] = following;
    const followers = conn.followers[targetId] || [];
    if (!followers.includes(meId)) followers.push(meId);
    conn.followers[targetId] = followers;
    localStorage.setItem(CONN_KEY, JSON.stringify(conn));
  } catch {}
}
export function unfollowUser(meId: string, targetId: string) {
  ensureSeed();
  try {
    const conn = JSON.parse(localStorage.getItem(CONN_KEY) || '{}') as { followers: Record<string,string[]>; following: Record<string,string[]> };
    conn.following[meId] = (conn.following[meId] || []).filter(id => id !== targetId);
    conn.followers[targetId] = (conn.followers[targetId] || []).filter(id => id !== meId);
    localStorage.setItem(CONN_KEY, JSON.stringify(conn));
  } catch {}
}
export function listMessages(forUserId: string): Message[] {
  ensureSeed();
  try { return (JSON.parse(localStorage.getItem(MSG_KEY) || '[]') || []).filter((m: Message) => m.toId === forUserId || m.fromId === forUserId); } catch { return []; }
}
