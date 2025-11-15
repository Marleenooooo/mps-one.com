import React, { useState } from 'react';
import type { Post, User } from '../services/mock';
import { addLike, listComments, addComment } from '../services/mock';

export function PostCard({ post, author, meId }: { post: Post; author: User; meId?: string }) {
  const [likeCount, setLikeCount] = useState(post.likes);
  const [commentCount, setCommentCount] = useState(post.comments);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(listComments(post.id));
  function like() {
    addLike(post.id);
    setLikeCount(likeCount + 1);
  }
  function submitComment() {
    const text = commentText.trim();
    if (!text) return;
    addComment({ id: Math.random().toString(36).slice(2), postId: post.id, authorId: meId || author.id, text, createdAt: Date.now() });
    setCommentText('');
    const next = listComments(post.id);
    setComments(next);
    setCommentCount(commentCount + 1);
  }
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
          <button className="btn" onClick={like}>Like ({likeCount})</button>
          <button className="btn">Comment ({commentCount})</button>
          <button className="btn">Share</button>
        </div>
        <div style={{ marginTop: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="input" placeholder="Write a comment" value={commentText} onChange={(e) => setCommentText(e.target.value)} />
            <button className="btn primary" onClick={submitComment}>Comment</button>
          </div>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {comments.slice().reverse().map(c => (
              <div key={c.id} className="card" style={{ padding: 8 }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(c.createdAt).toLocaleString()}</div>
                <div>{c.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
