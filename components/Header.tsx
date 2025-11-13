import { ReactNode } from 'react';
import ThemeToggle from './ThemeToggle';
import ModeToggle from './ModeToggle';

export default function Header({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <header className="w-full border-b border-border">
      <div className="bg-gradient-to-r from-[#E3F2FD] to-surface dark:from-[#0A1F4D] dark:to-[#0A0F2D]">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-[var(--module-procurement)] to-[#0055CC] dark:from-[#00F0FF] dark:to-[#0077FF] bg-clip-text text-transparent">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            {actions}
            <ModeToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
