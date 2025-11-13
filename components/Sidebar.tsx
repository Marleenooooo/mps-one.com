import Link from 'next/link';

const items = [
  { href: '/onboarding/company', label: 'Onboarding', key: 'procurement' },
  { href: '/feed', label: 'Feed', key: 'procurement' },
  { href: '/profile/acme', label: 'Profile', key: 'inventory' },
  { href: '/admin/kyc', label: 'Admin KYC', key: 'reports' },
  { href: '/admin/connections', label: 'Admin Connections', key: 'reports' },
  { href: '/admin/dashboard', label: 'Admin Dashboard', key: 'reports' },
  { href: '/admin/network-graph', label: 'Admin Network Graph', key: 'reports' },
  { href: '/admin/panel', label: 'Admin Panel', key: 'reports' },
  { href: '/auth/sign-in', label: 'Sign In', key: 'finance' },
];

export default function Sidebar() {
  return (
    <aside className="w-56 border-r border-border bg-surface min-h-screen p-4">
      <nav className="space-y-2">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="block rounded-md px-3 py-2 text-sm hover:bg-[var(--module-color)]/8">
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
