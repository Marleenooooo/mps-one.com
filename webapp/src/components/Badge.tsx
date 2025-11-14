import React from 'react';

export function Badge({ children, variant = 'secondary' }: { children: React.ReactNode; variant?: 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'primary' | 'outline' }) {
  const styles =
    variant === 'success'
      ? 'bg-green-100 text-green-800'
      : variant === 'warning'
      ? 'bg-yellow-100 text-yellow-800'
      : variant === 'danger'
      ? 'bg-red-100 text-red-800'
      : variant === 'info'
      ? 'bg-blue-100 text-blue-800'
      : variant === 'outline'
      ? 'border border-gray-300 text-gray-700'
      : 'bg-gray-100 text-gray-800';
  return <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles}`}>{children}</span>;
}
