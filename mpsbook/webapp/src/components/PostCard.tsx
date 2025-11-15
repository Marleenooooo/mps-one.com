import React from 'react';
import type { Post, User } from '../services/mock';

export function PostCard({ post, author }: { post: Post; author: User }) {
  return (
    <div className="card post">
      <div className="avatar" />
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 600 }}>{author.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(post.createdAt).toLocaleString()}</div>
        </div>
        {author.headline && (
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{author.headline}</div>
        )}
        <div style={{ marginTop: 8 }}>{post.content}</div>
        <div className="actions">
          <button className="btn">Like ({post.likes})</button>
          <button className="btn">Comment ({post.comments})</button>
          <button className="btn">Share</button>
        </div>
      </div>
    </div>
  );
}

