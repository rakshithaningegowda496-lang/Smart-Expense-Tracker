import React from 'react';
import {
  Wallet,
  Bell,
  LogOut,
  LayoutDashboard,
  Receipt,
  FileSpreadsheet,
  Users,
  CheckCircle2,
  Database,
  User,
} from 'lucide-react';
import { UserRole } from '../types.ts';

interface NavbarProps {
  role: UserRole;
  userName: string;
  department: string;
  unreadCount: number;
  activeTab: string;
  isRealtimeConnected?: boolean;
  onTabChange: (tab: string) => void;
  onOpenNotifications: () => void;
  onOpenApiDocs: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  role,
  userName,
  department,
  unreadCount,
  activeTab,
  isRealtimeConnected = true,
  onTabChange,
  onOpenNotifications,
  onOpenApiDocs,
  onLogout,
}) => {
  const employeeTabs = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'expenses', label: 'My Expenses', icon: Receipt },
    { id: 'payable', label: 'Reimbursement', icon: FileSpreadsheet },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const managerTabs = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'review', label: 'Team Review', icon: CheckCircle2 },
    { id: 'team', label: 'My Team', icon: Users },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const tabs = role === 'EMPLOYEE' ? employeeTabs : managerTabs;

  return (
    <>
      {/* Desktop & Main Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Zone 1: Brand Wordmark */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-900 text-white shadow-sm">
                <Wallet className="w-5 h-5 text-sky-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 text-base leading-tight">
                  ExpenseFlow
                </span>
                <span className="text-[11px] text-slate-500 font-medium leading-none">
                  {department} · {role}
                </span>
              </div>
            </div>

            {/* Zone 2: Navigation Links (Desktop) */}
            <nav className="hidden md:flex items-center gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: Actions (Real-time status, Notifications, Schema/API Docs, Logout) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Real-Time Live Sync Indicator */}
              <div
                title={isRealtimeConnected ? 'Real-Time WebSocket Sync Active' : 'Connecting Real-Time Sync...'}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full border bg-slate-50 border-slate-200 text-slate-600"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isRealtimeConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span className="hidden md:inline">
                  {isRealtimeConnected ? 'Live Sync' : 'Connecting...'}
                </span>
              </div>

              {/* MySQL & REST API Docs Modal Trigger */}
              <button
                type="button"
                onClick={onOpenApiDocs}
                title="MySQL Schema & REST APIs for Android"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-sky-600" />
                <span className="hidden lg:inline">MySQL & APIs</span>
              </button>

              {/* Notification Bell */}
              <button
                type="button"
                onClick={onOpenNotifications}
                title="Notifications"
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-rose-600 rounded-full animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* User Avatar & Logout */}
              <div className="flex items-center pl-2 border-l border-slate-200 gap-2">
                <button
                  onClick={() => onTabChange('profile')}
                  className="flex items-center gap-2 text-left cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden xl:inline text-xs font-medium text-slate-700 group-hover:text-slate-900">
                    {userName}
                  </span>
                </button>

                <button
                  onClick={onLogout}
                  title="Sign out"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Matching uploaded screenshots) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-[10px] font-medium transition cursor-pointer ${
                  isActive ? 'text-slate-900 font-semibold' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <div
                  className={`p-1 rounded-lg transition ${
                    isActive ? 'bg-slate-100 text-slate-900' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="mt-0.5">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
