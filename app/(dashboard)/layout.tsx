'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DataService } from '@/lib/dataService';
import { NotificationService, AppNotification } from '@/lib/notificationService';
import { Logo } from '@/components/Logo';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showMigrationPrompt, setShowMigrationPrompt] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const loadNotifications = async () => {
      const fetchedNotifications = await NotificationService.getNotifications(user?.uid, user?.isAnonymous);
      setNotifications(fetchedNotifications);
    };
    loadNotifications();
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && !user.isAnonymous && DataService.hasGuestData()) {
      setShowMigrationPrompt(true);
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-white dark:bg-dark-bg">
        <Logo className="w-12 h-12 animate-pulse" />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleMigrate = async () => {
    if (user && !user.isAnonymous) {
      setIsMigrating(true);
      await DataService.migrateGuestData(user.uid);
      setIsMigrating(false);
      setShowMigrationPrompt(false);
    }
  };

  const handleDeclineMigration = () => {
    DataService.clearGuestData();
    setShowMigrationPrompt(false);
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-white dark:bg-dark-bg font-sans text-slate-900 dark:text-dark-text-primary transition-colors duration-300">
      {/* Migration Prompt Modal */}
      {showMigrationPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-dark-secondary rounded-2xl shadow-xl max-w-md w-full p-6 text-center space-y-4 border dark:border-dark-border">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Migrate Guest Data?</h3>
            <p className="text-sm text-slate-600">
              We noticed you have data saved from a previous guest session. Would you like to sync it to your new account?
            </p>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={handleDeclineMigration}
                disabled={isMigrating}
                className="flex-1 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-dark-text-secondary bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50"
              >
                No, discard
              </button>
              <button 
                onClick={handleMigrate}
                disabled={isMigrating}
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50"
              >
                {isMigrating ? 'Migrating...' : 'Yes, sync data'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-100 dark:border-dark-border flex flex-col bg-slate-50/50 dark:bg-dark-secondary hidden md:flex shrink-0 transition-colors duration-300">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="w-8 h-8 rounded-lg shadow-sm" />
            <span className="font-bold text-xl tracking-tight text-blue-900 dark:text-white">TaskPilot AI</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <Link href="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${pathname === '/dashboard' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-dark-text-secondary hover:bg-white dark:hover:bg-dark-elevated hover:text-slate-900 dark:hover:text-dark-text-primary'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            Dashboard
          </Link>
          <Link href="/calendar" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${pathname === '/calendar' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-dark-text-secondary hover:bg-white dark:hover:bg-dark-elevated hover:text-slate-900 dark:hover:text-dark-text-primary'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            Calendar
          </Link>
          <Link href="/pilot-chat" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${pathname === '/pilot-chat' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-dark-text-secondary hover:bg-white dark:hover:bg-dark-elevated hover:text-slate-900 dark:hover:text-dark-text-primary'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
            Pilot Chat
          </Link>
          <Link href="/habits" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${pathname === '/habits' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-dark-text-secondary hover:bg-white dark:hover:bg-dark-elevated hover:text-slate-900 dark:hover:text-dark-text-primary'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Habits
          </Link>
          <Link href="/goals" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${pathname === '/goals' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-dark-text-secondary hover:bg-white dark:hover:bg-dark-elevated hover:text-slate-900 dark:hover:text-dark-text-primary'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            Goals
          </Link>
          <Link href="/analytics" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${pathname === '/analytics' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-dark-text-secondary hover:bg-white dark:hover:bg-dark-elevated hover:text-slate-900 dark:hover:text-dark-text-primary'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            Analytics
          </Link>
          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-dark-divider"></div>
          <Link href="/profile" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${pathname === '/profile' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-dark-text-secondary hover:bg-white dark:hover:bg-dark-elevated hover:text-slate-900 dark:hover:text-dark-text-primary'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            Profile
          </Link>
          <Link href="/settings" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${pathname === '/settings' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-dark-text-secondary hover:bg-white dark:hover:bg-dark-elevated hover:text-slate-900 dark:hover:text-dark-text-primary'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            Settings
          </Link>
        </nav>

        <div className="p-6 space-y-4">
          <div className="bg-blue-600 rounded-2xl p-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-2">Pilot Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">AI Optimization Active</span>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-dark-text-secondary hover:text-slate-900 dark:hover:text-dark-text-primary hover:bg-slate-100 dark:hover:bg-dark-elevated rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-slate-100 dark:border-dark-border flex items-center justify-between px-4 md:px-8 bg-white dark:bg-dark-bg shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-dark-text-primary truncate max-w-[200px] sm:max-w-xs">
                Welcome, {user.isAnonymous ? 'Guest' : (user.displayName?.split(' ')[0] || 'Explorer')}
              </h1>
              <p className="text-xs md:text-sm text-slate-500 dark:text-dark-text-secondary hidden sm:block">Your AI Pilot has scheduled 4 high-priority focus sessions for today.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-400 hover:text-blue-600 transition-colors relative"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-secondary border border-slate-100 dark:border-dark-border rounded-2xl shadow-xl z-40 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 dark:border-dark-divider flex justify-between items-center bg-slate-50 dark:bg-dark-elevated">
                    <h3 className="font-bold text-slate-800 dark:text-dark-text-primary">Smart Notifications</h3>
                    <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Mark all read</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-500 dark:text-dark-text-secondary">No notifications</div>
                    ) : (
                      notifications.map(notification => (
                        <div key={notification.id} className={`p-4 border-b border-slate-50 dark:border-dark-divider hover:bg-slate-50 dark:hover:bg-dark-elevated transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                          <p className="text-sm font-semibold text-slate-800 dark:text-dark-text-primary">{notification.title}</p>
                          <p className="text-xs text-slate-500 dark:text-dark-text-secondary mt-1">{notification.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <Link href="/profile" className="w-10 h-10 rounded-full bg-slate-200 dark:bg-dark-elevated border-2 border-white dark:border-dark-bg shadow-sm overflow-hidden shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 dark:hover:ring-offset-dark-bg transition-all block">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold">
                  {user.isAnonymous ? 'G' : (user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U')}
                </div>
              )}
            </Link>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50/30 dark:bg-transparent pb-32 md:pb-0">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-secondary border-t border-slate-100 dark:border-dark-divider shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-none rounded-t-2xl z-40 pb-[env(safe-area-inset-bottom,16px)] transition-colors duration-300">
        <div className="flex items-center justify-between px-2 pt-2 pb-1">
          <Link href="/dashboard" className={`flex flex-col items-center flex-1 py-1 gap-1 ${pathname === '/dashboard' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 hover:text-slate-600 dark:text-dark-text-muted dark:hover:text-dark-text-primary'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            <span className="text-[10px] font-medium tracking-wide">Home</span>
          </Link>
          <Link href="/calendar" className={`flex flex-col items-center flex-1 py-1 gap-1 ${pathname === '/calendar' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 hover:text-slate-600 dark:text-dark-text-muted dark:hover:text-dark-text-primary'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <span className="text-[10px] font-medium tracking-wide">Calendar</span>
          </Link>
          <Link href="/pilot-chat" className={`flex flex-col items-center flex-1 py-1 gap-1 ${pathname === '/pilot-chat' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 hover:text-slate-600 dark:text-dark-text-muted dark:hover:text-dark-text-primary'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
            <span className="text-[10px] font-medium tracking-wide">Chat</span>
          </Link>
          <Link href="/habits" className={`flex flex-col items-center flex-1 py-1 gap-1 ${pathname === '/habits' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 hover:text-slate-600 dark:text-dark-text-muted dark:hover:text-dark-text-primary'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span className="text-[10px] font-medium tracking-wide">Habits</span>
          </Link>
          <Link href="/goals" className={`flex flex-col items-center flex-1 py-1 gap-1 ${pathname === '/goals' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 hover:text-slate-600 dark:text-dark-text-muted dark:hover:text-dark-text-primary'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            <span className="text-[10px] font-medium tracking-wide">Goals</span>
          </Link>
          <button onClick={() => setIsMoreMenuOpen(true)} className={`flex flex-col items-center flex-1 py-1 gap-1 ${isMoreMenuOpen ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 hover:text-slate-600 dark:text-dark-text-muted dark:hover:text-dark-text-primary'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
            <span className="text-[10px] font-medium tracking-wide">More</span>
          </button>
        </div>
      </nav>

      {/* More Bottom Sheet */}
      {isMoreMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsMoreMenuOpen(false)}></div>
          <div className="relative w-full bg-white dark:bg-dark-secondary rounded-t-3xl shadow-xl flex flex-col animate-in slide-in-from-bottom-full duration-300 pb-[env(safe-area-inset-bottom,16px)]">
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            </div>
            <div className="px-6 pb-4 pt-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-dark-text-primary mb-4">More</h2>
              <div className="space-y-2">
                <Link onClick={() => setIsMoreMenuOpen(false)} href="/analytics" className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-medium transition-colors ${pathname === '/analytics' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'bg-slate-50 dark:bg-dark-elevated text-slate-700 dark:text-dark-text-primary hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                  <div className={`p-2 rounded-xl ${pathname === '/analytics' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : 'bg-white dark:bg-dark-secondary text-slate-500 dark:text-dark-text-secondary shadow-sm'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                  </div>
                  Analytics
                </Link>
                <Link onClick={() => setIsMoreMenuOpen(false)} href="/profile" className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-medium transition-colors ${pathname === '/profile' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'bg-slate-50 dark:bg-dark-elevated text-slate-700 dark:text-dark-text-primary hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                  <div className={`p-2 rounded-xl ${pathname === '/profile' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : 'bg-white dark:bg-dark-secondary text-slate-500 dark:text-dark-text-secondary shadow-sm'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  </div>
                  Profile
                </Link>
                <Link onClick={() => setIsMoreMenuOpen(false)} href="/settings" className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-medium transition-colors ${pathname === '/settings' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'bg-slate-50 dark:bg-dark-elevated text-slate-700 dark:text-dark-text-primary hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                  <div className={`p-2 rounded-xl ${pathname === '/settings' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : 'bg-white dark:bg-dark-secondary text-slate-500 dark:text-dark-text-secondary shadow-sm'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </div>
                  Settings
                </Link>
                <button 
                  onClick={() => { setIsMoreMenuOpen(false); handleLogout(); }}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors mt-4"
                >
                  <div className="p-2 rounded-xl bg-white dark:bg-dark-secondary text-red-500 shadow-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                  </div>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
