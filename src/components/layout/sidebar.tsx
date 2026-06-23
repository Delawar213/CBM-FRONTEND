'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, FileText, Receipt, Quote, FolderOpen,
  Briefcase, BarChart3, Settings, LogOut, ChevronLeft, Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/providers';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';

const navSections = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard.read' },
      { href: '/reports', label: 'Reports', icon: BarChart3, permission: 'reports.read' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/customers', label: 'Customers', icon: Users, permission: 'customers.read' },
      { href: '/projects', label: 'Projects', icon: Briefcase, permission: 'projects.read' },
      { href: '/documents', label: 'Documents', icon: FolderOpen, permission: 'documents.read' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/quotations', label: 'Quotations', icon: Quote, permission: 'quotations.read' },
      { href: '/invoices', label: 'Invoices', icon: Receipt, permission: 'invoices.read' },
      { href: '/expenses', label: 'Expenses', icon: FileText, permission: 'expenses.read' },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/settings', label: 'Settings', icon: Settings, permission: 'users.read' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();
  const { user, logout, hasPermission } = useAuthStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border text-sidebar-foreground transition-all duration-200',
        'bg-gradient-to-b from-[#0c1a2e] via-[#0f2035] to-[#0a1522]',
        collapsed ? 'w-[68px]' : 'w-60',
      )}
    >
      <div className="flex h-14 items-center gap-3 border-b border-sidebar-border/80 px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/20 ring-1 ring-brand/30">
          <Building2 className="h-4 w-4 text-brand" strokeWidth={1.75} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">CONCREATE</p>
            <p className="truncate text-[10px] uppercase tracking-widest text-sidebar-muted">Building ERP</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4">
        {navSections.map((section) => {
          const items = section.items.filter((item) => hasPermission(item.permission));
          if (!items.length) return null;

          return (
            <div key={section.label} className="mb-5">
              {!collapsed && (
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-muted">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {items.map((item) => {
                  const Icon = item.icon;
                  const active = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                        active
                          ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/10'
                          : 'text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground',
                        active && 'border-l-[3px] border-l-brand pl-[9px]',
                      )}
                    >
                      <Icon
                        className={cn('h-4 w-4 shrink-0', active ? 'text-brand' : 'opacity-70')}
                        strokeWidth={1.75}
                      />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-2">
        {!collapsed && user && (
          <div className="mb-2 rounded-md bg-sidebar-accent px-3 py-2.5">
            <p className="truncate text-sm font-medium text-white">{user.firstName} {user.lastName}</p>
            <p className="truncate text-xs text-sidebar-muted">{user.roles[0] ?? 'User'}</p>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-sidebar-muted hover:bg-sidebar-accent hover:text-white"
            onClick={toggle}
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
          </Button>
          <Button
            variant="ghost"
            size={collapsed ? 'icon' : 'default'}
            className={cn(
              'text-sidebar-muted hover:bg-sidebar-accent hover:text-white',
              !collapsed && 'flex-1 justify-start text-sm',
            )}
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && 'Sign out'}
          </Button>
        </div>
      </div>
    </aside>
  );
}
