'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export default function DashboardShell({ items, children }: { items: DashboardNavItem[]; children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuthStore();

  return (
    <div className="flex flex-col md:flex-row gap-6 md:items-start">
      <aside className="md:w-56 shrink-0 md:sticky md:top-24">
        <nav className="bg-white rounded-2xl border border-ink/10 p-2 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  active ? 'bg-brand text-white' : 'text-ink/70 hover:bg-sand'
                }`}>
                <Icon size={17} strokeWidth={2.2} />
                {label}
              </Link>
            );
          })}
          <div className="hidden md:block h-px bg-ink/10 my-1.5" />
          <button onClick={logout}
            className="hidden md:flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-flag/80 hover:bg-flag/5 transition-colors">
            <LogOut size={17} strokeWidth={2.2} />
            Déconnexion
          </button>
        </nav>
      </aside>
      <div className="flex-1 min-w-0 w-full space-y-6">{children}</div>
    </div>
  );
}
