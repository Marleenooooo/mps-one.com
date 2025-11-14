import React from 'react';

export function Alert({ children, variant = 'info', onClose }: { children: React.ReactNode; variant?: 'info' | 'danger' | 'warning' | 'success'; onClose?: () => void }) {
  const styles =
    variant === 'danger'
      ? 'bg-red-50 text-red-800 border-red-200'
      : variant === 'warning'
      ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
      : variant === 'success'
      ? 'bg-green-50 text-green-800 border-green-200'
      : 'bg-blue-50 text-blue-800 border-blue-200';
  return (
    <div className={`border rounded-md p-3 ${styles}`}>
      <div className="flex justify-between items-start">
        <div>{children}</div>
        {onClose && (
          <button aria-label="Close" onClick={onClose} className="text-sm">×</button>
        )}
      </div>
    </div>
  );
}
