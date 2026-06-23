'use client';

import { usePathname } from 'next/navigation';
import { Bell, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/stores/auth-store';
import { useMounted } from '@/components/providers';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  customers: 'Customers',
  documents: 'Documents',
  quotations: 'Quotations',
  invoices: 'Invoices',
  expenses: 'Expenses',
  projects: 'Projects',
  reports: 'Reports',
  settings: 'Settings',
};

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const user = useAuthStore((s) => s.user);

  const segment = pathname.split('/').filter(Boolean)[0] ?? 'dashboard';
  const pageLabel = routeLabels[segment] ?? 'Overview';

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">CBM ERP</span>
        <span className="text-muted-foreground/50">/</span>
        <span className="font-medium text-foreground">{pageLabel}</span>
      </div>

      <div className="flex items-center gap-1">
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <Bell className="h-4 w-4" />
        </Button>
        <div className="ml-2 flex items-center gap-2 border-l border-border pl-3">
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full',
              'bg-primary text-xs font-semibold text-primary-foreground',
            )}
          >
            {initials}
          </div>
          {user && (
            <div className="hidden sm:block">
              <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
