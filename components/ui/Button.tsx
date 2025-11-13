"use client";
import { ComponentProps } from 'react';
import { clsx } from 'clsx';

type Variant = 'primary' | 'secondary' | 'success' | 'danger' | 'outline';

type Props = ComponentProps<'button'> & {
  variant?: Variant;
};

export default function Button({ variant = 'primary', className, disabled, ...rest }: Props) {
  const base = 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-200';
  const states = {
    primary: 'btn-primary text-white hover:scale-[1.02] hover:shadow-[0_0_10px_rgba(0,119,255,0.3)] active:brightness-90 disabled:opacity-40 disabled:bg-[var(--color-border)]',
    secondary: 'btn-secondary text-white hover:scale-[1.02] hover:shadow-[0_0_10px_rgba(255,138,0,0.3)] active:brightness-90 disabled:opacity-40 disabled:bg-[var(--color-border)]',
    success: 'btn-success text-white hover:scale-[1.02] active:brightness-90 disabled:opacity-40 disabled:bg-[var(--color-border)]',
    danger: 'btn-danger text-white hover:scale-[1.02] active:brightness-90 disabled:opacity-40 disabled:bg-[var(--color-border)]',
    outline: 'border border-[var(--module-color)] text-[var(--module-color)] bg-transparent hover:bg-[var(--module-color)]/20',
  } as const;

  return (
    <button className={clsx(base, states[variant], className)} disabled={disabled} {...rest} />
  );
}
