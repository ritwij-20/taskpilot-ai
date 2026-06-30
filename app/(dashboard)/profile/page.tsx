'use client';

import { useAuth } from '@/contexts/AuthContext';
import { DataService } from '@/lib/dataService';
import { useState } from 'react';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = async () => {
    if (user && !user.isAnonymous) {
      setIsSyncing(true);
      await DataService.migrateGuestData(user.uid);
      setTimeout(() => setIsSyncing(false), 1000);
    }
  };

  return (
    <div className="p-4 md:p-8 min-h-full flex flex-col max-w-3xl mx-auto w-full">
      <div className="mb-8 shrink-0">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-dark-text-primary">Profile</h1>
        <p className="text-slate-500 dark:text-dark-text-secondary text-sm mt-1">Manage your account and data.</p>
      </div>

      <div className="bg-white dark:bg-dark-secondary border border-slate-100 dark:border-dark-border rounded-3xl p-6 shadow-sm mb-6 transition-colors duration-300">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-3xl shrink-0 overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user?.isAnonymous ? 'G' : (user?.displayName?.charAt(0) || 'U')
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-dark-text-primary">{user?.isAnonymous ? 'Guest User' : (user?.displayName || 'Unknown User')}</h2>
            <p className="text-slate-500 dark:text-dark-text-secondary">{user?.email || 'No email attached'}</p>
            {user?.isAnonymous && (
              <span className="inline-block px-2 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-lg mt-2">Guest Account</span>
            )}
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-dark-divider pt-6 space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-dark-text-primary mb-2">Cloud Sync</h3>
          
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-dark-elevated rounded-2xl border border-slate-100 dark:border-dark-border">
            <div>
              <p className="font-medium text-slate-800 dark:text-dark-text-primary">Sync Guest Data</p>
              <p className="text-sm text-slate-500 dark:text-dark-text-secondary">Migrate local tasks to your cloud account.</p>
            </div>
            <button 
              onClick={handleManualSync}
              disabled={isSyncing || user?.isAnonymous}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-secondary border border-slate-100 dark:border-dark-border rounded-3xl p-6 shadow-sm transition-colors duration-300">
        <h3 className="font-bold text-red-600 dark:text-red-400 mb-4">Danger Zone</h3>
        <button 
          onClick={logout}
          className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
