import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
};

export function Button({ variant = 'primary', size = 'md', className, ...props }: Props) {
  const base = 'inline-flex items-center rounded-md';
  const sizes = size === 'sm' ? 'px-2 py-1 text-sm' : size === 'lg' ? 'px-5 py-3 text-lg' : 'px-4 py-2';
  const variants =
    variant === 'outline'
      ? 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
      : variant === 'success'
      ? 'bg-green-600 text-white hover:bg-green-700'
      : variant === 'warning'
      ? 'bg-yellow-600 text-white hover:bg-yellow-700'
      : variant === 'danger'
      ? 'bg-red-600 text-white hover:bg-red-700'
      : 'bg-blue-600 text-white hover:bg-blue-700';
  return <button {...props} className={`${base} ${sizes} ${variants} ${className || ''}`.trim()} />;
}
