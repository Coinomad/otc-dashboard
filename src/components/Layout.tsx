import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ArrowRightLeft,
  TrendingUp,
  LogOut,
  Menu,
  Wallet,
  X,
  ChevronRight,
  Bell,
} from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

interface User {
  id: string;
  name: string;
  email: string;
}

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Clients', path: '/clients', icon: Users },
  { name: 'Transactions', path: '/transactions', icon: ArrowRightLeft },
  { name: 'Rates', path: '/rates', icon: TrendingUp },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('otc_user');
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('otc_token');
    localStorage.removeItem('otc_user');
    navigate('/login');
  };

  const currentPage = navItems.find(
    (item) =>
      location.pathname === item.path ||
      (item.path !== '/' && location.pathname.startsWith(item.path)),
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-navy via-navy-900 to-navy-950 text-white relative overflow-hidden">
      {/* Subtle glow behind brand */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand */}
      <div className="relative px-5 pt-6 pb-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/25 ring-1 ring-white/10">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-none">Coinomad</h1>
            <p className="text-navy-400 text-[11px] mt-0.5 font-medium uppercase tracking-wider">OTC Console</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto relative">
        <p className="px-3 text-[10px] font-semibold text-navy-400 uppercase tracking-wider mb-2">Operations</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-navy-300 hover:bg-white/5 hover:text-white',
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-teal-400 rounded-r-full" />
              )}
              <Icon className={cn('w-5 h-5 flex-shrink-0 transition-colors', isActive ? 'text-teal-300' : 'text-navy-400 group-hover:text-navy-200')} />
              <span>{item.name}</span>
              {isActive && <ChevronRight className="w-4 h-4 ml-auto text-navy-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="relative p-3 border-t border-white/5 space-y-2">
        {/* User profile */}
        {user && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-navy-400 truncate">{user.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-left text-navy-300 hover:bg-white/5 hover:text-white rounded-xl text-sm font-medium transition-all duration-150"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-10 h-full w-64 shadow-2xl animate-slide-in">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 flex-shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4 min-w-0">
            <button
              className="lg:hidden text-slate-500 hover:text-slate-700 transition-colors p-1.5 -ml-1.5 rounded-lg hover:bg-slate-100"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 min-w-0">
              <div className="hidden sm:flex w-8 h-8 rounded-lg bg-teal-50 items-center justify-center">
                <TrendingUp className="w-4 h-4 text-teal" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800 truncate">
                {currentPage?.name || 'Dashboard'}
              </h2>
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full bg-navy-100 text-navy-700 text-xs font-medium flex-shrink-0">
                Exchange Ops
              </span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button className="hidden sm:flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 text-sm text-slate-500 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-medium text-emerald-700">Live</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
