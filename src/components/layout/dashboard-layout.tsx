'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { useSidebar } from '@/components/providers';
import { cn } from '@/lib/utils';

export function DashboardLayout({
  children,
  fullWidth = false,
}: {
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { collapsed } = useSidebar();

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className={cn('flex min-h-screen flex-col transition-all duration-200', collapsed ? 'ml-[68px]' : 'ml-60')}>
        <Header />
        <main className={cn('flex-1', fullWidth ? 'p-4' : 'p-6 lg:p-8')}>
          <div className={cn(fullWidth ? 'w-full' : 'mx-auto max-w-[1400px]')}>{children}</div>
        </main>
      </div>
    </div>
  );
}
