import React from 'react';
import { listPosts, listUsers } from '../services/mock';

export function Post() {
  const users = listUsers();
  const posts = listPosts();
  const post = posts[0];
  const author = users.find(u => u.id === post.authorId);
  return (
    <div style={{ padding: 16 }}>
      <div className="card" style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 10 }}>
        <div className="avatar" />
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 600 }}>{author?.name || '—'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(post.createdAt).toLocaleString()}</div>
          </div>
          <div style={{ marginTop: 6 }}>{post.content}</div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
            <div>❤ {post.likes}</div>
            <div>💬 {post.comments}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

