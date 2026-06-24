'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2, Users, FileText, Receipt, Briefcase, Shield,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const FEATURES = [
  { icon: Users, label: 'Customers & CRM', color: 'bg-teal-400/20 text-teal-200' },
  { icon: Briefcase, label: 'Projects', color: 'bg-amber-400/20 text-amber-200' },
  { icon: FileText, label: 'Quotations', color: 'bg-violet-400/20 text-violet-200' },
  { icon: Receipt, label: 'Invoices', color: 'bg-sky-400/20 text-sky-200' },
];

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('admin@cbm.com');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const result = data.data || data;
      setAuth(result.user, result.accessToken, result.refreshToken);
      router.push('/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; code?: string };
      if (!axiosErr.response) {
        setError('Cannot reach server. Ensure the backend is running on port 4000.');
      } else {
        setError(axiosErr.response?.data?.message || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Brand panel — vivid gradient, readable text */}
      <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-700 via-blue-700 to-teal-600 p-10 text-white lg:flex xl:p-12">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-yellow-400/20 blur-3xl" />
        <div className="absolute -bottom-16 left-10 h-64 w-64 rounded-full bg-pink-400/15 blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-40 w-40 rounded-full bg-cyan-300/10 blur-2xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-2 ring-amber-400/50 backdrop-blur-sm">
            <Building2 className="h-5 w-5 text-amber-300" strokeWidth={2} />
          </div>
          <div>
            <p className="text-base font-bold tracking-tight">CONCREATE Building</p>
            <p className="text-xs font-medium text-blue-100">Enterprise Resource Planning</p>
          </div>
        </div>

        <div className="relative space-y-6">
          <div>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-white xl:text-4xl">
              Manage your construction business with confidence.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-blue-50/90">
              Unified platform for customers, projects, quotations, invoices, expenses, and document management.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map(({ icon: Icon, label, color }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 rounded-xl bg-white/10 px-3 py-2.5 backdrop-blur-sm ring-1 ring-white/15"
              >
                <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', color)}>
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </div>
                <span className="text-xs font-semibold text-white">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-between text-xs text-blue-100/80">
          <p>© {new Date().getFullYear()} CONCREATE Building Management</p>
          <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/20">
            <Shield className="h-3.5 w-3.5 text-emerald-300" />
            <span className="font-medium text-emerald-100">Secure login</span>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="relative flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 p-6 sm:p-10">
        {/* Mobile brand strip */}
        <div className="mb-8 flex w-full max-w-[420px] items-center gap-3 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-md">
            <Building2 className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <p className="font-bold text-foreground">CONCREATE ERP</p>
            <p className="text-xs text-muted-foreground">Building Management</p>
          </div>
        </div>

        <div className="w-full max-w-[420px]">
          <div className="rounded-2xl border border-border/60 bg-white p-8 shadow-xl shadow-indigo-500/10 dark:bg-card sm:p-10">
            <div className="mb-8 space-y-1.5 text-center sm:text-left">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h2>
              <p className="text-sm text-muted-foreground">
                Sign in to your account to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="normal-case tracking-normal text-foreground">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="h-11 border-border/80 bg-slate-50/50 focus-visible:ring-indigo-500/30"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="normal-case tracking-normal text-foreground">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 border-border/80 bg-slate-50/50 focus-visible:ring-indigo-500/30"
                  required
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="h-11 w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-base font-semibold shadow-md shadow-indigo-500/25 hover:from-indigo-700 hover:to-blue-700"
                disabled={loading}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                <Link
                  href="/update-password"
                  className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline dark:text-indigo-400"
                >
                  Update password
                </Link>
              </p>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            CONCREATE Building Maintenance LLC · CBM ERP
          </p>
        </div>
      </div>
    </div>
  );
}
