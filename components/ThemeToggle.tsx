"use client";
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import Button from './ui/Button';

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Until mounted on client, render a stable label to avoid hydration mismatches
  const isDark = (resolvedTheme ?? theme) === 'dark';
  const label = mounted ? (isDark ? 'Light Mode' : 'Dark Mode') : 'Toggle Theme';

  return (
    <Button
      variant="outline"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      {label}
    </Button>
  );
}
