import React, { useState } from 'react';
import { addPost } from '../services/mock';

export function Composer({ authorId, onPosted }: { authorId: string; onPosted: () => void }) {
  const [text, setText] = useState('');
  function submit() {
    const content = text.trim();
    if (!content) return;
    addPost({ id: Math.random().toString(36).slice(2), authorId, content, createdAt: Date.now(), likes: 0, comments: 0 });
    setText('');
    onPosted();
  }
  return (
    <div className="card composer">
      <div className="avatar" />
      <div>
        <textarea className="input" rows={3} placeholder="Share an update..." value={text} onChange={(e) => setText(e.target.value)} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button className="btn primary" onClick={submit}>Post</button>
        </div>
      </div>
    </div>
  );
}

