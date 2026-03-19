import React, { useState, Component } from 'react';
import { useStore } from '../lib/store';
import {
  LayoutDashboard,
  LineChart,
  Wallet,
  Radio,
  Bot,
  Settings,
  LogOut,
  Menu,
  ShieldCheck,
  Users,
  X,
  Zap,
  Gift,
  Calendar,
} from
'lucide-react';
import { cn } from '../lib/utils';
interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}
export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { user, logout } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const allNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'trade',
      label: 'Trade',
      icon: LineChart
    },
    {
      id: 'wallet',
      label: 'Wallet',
      icon: Wallet
    },
    {
      id: 'copy-trading',
      label: 'Copy Trading',
      icon: Users
    },
    {
      id: 'signals',
      label: 'Signals',
      icon: Radio
    },
    {
      id: 'bot',
      label: 'Bot',
      icon: Bot
    },
    {
      id: 'funded-accounts',
      label: 'Funded Accounts',
      icon: Zap
    },
    {
      id: 'referral',
      label: 'Referral',
      icon: Gift
    },
    {
      id: 'history',
      label: 'History',
      icon: Calendar
    },
    {
      id: 'kyc',
      label: 'KYC',
      icon: ShieldCheck
    },
    ...(user?.isAdmin ? [{
      id: 'admin',
      label: 'Admin',
      icon: ShieldCheck
    }] : []),
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings
    }
  ];

  const navItems = allNavItems;

  const handleNav = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };
  // Bottom Navigation Component
  const BottomNav = () =>
  <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-100 dark:bg-[#161b22] border-t border-gray-300 dark:border-[#21262d] z-40 flex justify-around items-center h-16 pb-safe">
      {[
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'trade',
      label: 'Trade',
      icon: LineChart
    },
    {
      id: 'signals',
      label: 'Signals',
      icon: Radio
    },
    {
      id: 'bot',
      label: 'Bot',
      icon: Bot
    }].
    map((item) =>
    <button
      key={item.id}
      onClick={() => onNavigate(item.id)}
      className={cn(
        'flex flex-col items-center justify-center w-full h-full space-y-1',
        currentPage === item.id ?
        'text-blue-600 dark:text-[#2962ff]' :
        'text-gray-600 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-white'
      )}>

          <item.icon className="h-5 w-5" />
          <span className="text-[10px] font-medium">{item.label}</span>
        </button>
    )}
    </div>;

  // Hide sidebar on Trade page for full screen experience
  if (currentPage === 'trade') {
    return (
      <div className="h-screen bg-white dark:bg-[#0d1117] text-gray-900 dark:text-[#c9d1d9] flex flex-col">
        {/* Minimal Header for Trade Page */}
        <div className="h-10 bg-gray-100 dark:bg-[#161b22] border-b border-gray-300 dark:border-[#21262d] flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <span className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-[#2962ff]" />
              ExplicitMarket
            </span>
            <div className="h-4 w-[1px] bg-gray-300 dark:bg-[#21262d]" />
            <button
              onClick={() => onNavigate('dashboard')}
              className="text-xs text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-white transition-colors">

              Exit Terminal
            </button>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <span>{user?.name}</span>
            <span className="text-green-600 dark:text-[#26a69a]">Connected</span>
          </div>
        </div>
        <main className="flex-1 overflow-hidden pb-16 md:pb-0">{children}</main>
        <BottomNav />
      </div>);

  }
  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117] text-gray-900 dark:text-[#c9d1d9] flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-300 dark:border-[#21262d] bg-gray-100 dark:bg-[#161b22]">
        <span className="font-bold text-gray-900 dark:text-white">ExplicitMarket</span>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ?
          <X className="h-6 w-6" /> :

          <Menu className="h-6 w-6" />
          }
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-56 bg-gray-50 dark:bg-[#161b22] border-r border-gray-200 dark:border-[#21262d] transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 flex flex-col',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}>

        <div className="p-6 border-b border-gray-200 dark:border-[#21262d]">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#2962ff]" />
            ExplicitMarket
          </h1>
        </div>

        <div className="p-3">
          <div className="mb-6 px-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 dark:bg-[#2962ff] flex items-center justify-center text-white font-bold text-xs">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {user?.name}
              </p>
              <p className="text-[10px] text-gray-600 dark:text-[#8b949e] truncate">ID: 8829102</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) =>
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={cn(
                'w-full flex items-center space-x-3 px-3 py-2 rounded text-sm font-medium transition-colors',
                currentPage === item.id ?
                'bg-gray-200 dark:bg-[#1c2128] text-gray-900 dark:text-white border-l-2 border-blue-600 dark:border-[#2962ff]' :
                'text-gray-600 dark:text-[#8b949e] hover:bg-gray-100 dark:hover:bg-[#1c2128] hover:text-gray-900 dark:hover:text-white border-l-2 border-transparent'
              )}>

                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            )}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-gray-200 dark:border-[#21262d]">
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded text-sm font-medium text-red-600 dark:text-[#ef5350] hover:bg-red-50 dark:hover:bg-[#ef5350]/10 transition-colors">

            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-white dark:bg-[#0d1117] pb-16 md:pb-0">
        {children}
      </main>

      <BottomNav />
    </div>);

}