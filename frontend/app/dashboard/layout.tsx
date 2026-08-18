'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Sparkles, LayoutDashboard, FileText, ClipboardList, 
  Briefcase, Bookmark, Settings, User, Bell, Power, 
  Menu, X, LineChart, Search, AlertCircle, HelpCircle
} from 'lucide-react';
import { api } from '@/lib/api';
import { ToastProvider, useToast } from '@/components/Toast';

function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    // Check authentication
    const tokens = api.getTokens();
    if (!tokens.access) {
      router.push('/login');
      return;
    }

    const cachedUser = api.getUser();
    setUser(cachedUser);

    const demoFlag = localStorage.getItem('demo_mode') === 'true';
    setIsDemo(demoFlag);
  }, [router]);

  const handleLogout = async () => {
    try {
      if (!isDemo) {
        await api.request('/auth/logout', { method: 'POST' });
      }
    } catch (e) {
      // Ignore
    }
    api.clearTokens();
    localStorage.removeItem('demo_mode');
    router.push('/');
  };

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Resumes', path: '/dashboard/resumes', icon: FileText },
    { name: 'Resume Analyzer', path: '/dashboard/analyzer', icon: ClipboardList },
    { name: 'Job Matcher', path: '/dashboard/matcher', icon: Briefcase },
    { name: 'Interview Prep', path: '/dashboard/interview-simulator', icon: HelpCircle },
    { name: 'Saved Jobs', path: '/dashboard/saved-jobs', icon: Bookmark },
    { name: 'Analytics', path: '/dashboard/analytics', icon: LineChart },
    { name: 'Profile', path: '/dashboard/profile', icon: User },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col md:flex-row relative">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-900 bg-slate-950/40 shrink-0">
        <div className="h-16 px-6 border-b border-slate-900 flex items-center gap-2">
          <div className="gradient-accent p-1.5 rounded-lg text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-base tracking-tight gradient-text">CareerLens AI</span>
        </div>

        {isDemo && (
          <div className="mx-4 mt-4 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-2 text-xs text-indigo-300">
            <AlertCircle className="w-4 h-4 shrink-0 animate-pulse" />
            <div>
              <p className="font-bold">Demo Mode Active</p>
              <p className="opacity-70 text-[10px]">Using preloaded sandbox data</p>
            </div>
          </div>
        )}

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active 
                    ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/15' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-900">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-indigo-400 text-xs border border-slate-700">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'User Profile'}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <Power className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Navbar */}
      <header className="md:hidden glass h-16 px-6 flex items-center justify-between z-30 relative border-b border-slate-900">
        <div className="flex items-center gap-2">
          <div className="gradient-accent p-1.5 rounded-lg text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-base tracking-tight gradient-text">CareerLens AI</span>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-slate-300 hover:text-white"
        >
          {sidebarOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-[#090a0f]/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex flex-col w-64 bg-slate-950 border-r border-slate-900 p-6 h-full">
            <div className="flex items-center justify-between mb-8">
              <span className="font-bold text-lg gradient-text">CareerLens AI</span>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400">
                <X />
              </button>
            </div>

            <nav className="flex-1 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active 
                        ? 'bg-indigo-500/10 text-indigo-300' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={handleLogout}
              className="mt-auto w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Power className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex h-16 items-center justify-between px-8 border-b border-slate-900">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search resumes, jobs, or skills..."
              className="w-full bg-slate-950/40 border border-slate-900 rounded-xl py-1.5 pl-9 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/30 transition-colors"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-slate-200 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
            </button>
            <div className="w-px h-6 bg-slate-800" />
            <span className="text-xs font-semibold text-slate-300">
              Welcome, <span className="text-white">{user?.name || 'Visitor'}</span>
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <DashboardShell>{children}</DashboardShell>
    </ToastProvider>
  );
}
