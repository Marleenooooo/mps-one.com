import React, { useState } from 'react';

type LoadingButtonProps = {
  onClick: () => Promise<void> | void;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function LoadingButton({ onClick, children, className, disabled, ...rest }: LoadingButtonProps) {
  const [loading, setLoading] = useState(false);
  async function handle() {
    try {
      setLoading(true);
      await onClick();
    } finally {
      setLoading(false);
    }
  }
  return (
    <button
      {...rest}
      className={`btn primary ${className ?? ''}`}
      onClick={handle}
      disabled={loading || disabled}
      aria-busy={loading}
    >
      {loading && <Spinner />} {children}
    </button>
  );
}

function Spinner() {
  return (
    <span aria-hidden="true" style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 999, border: '2px solid rgba(255,255,255,0.6)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />
  );
}

// Keyframes appended via global stylesheet in index.css
