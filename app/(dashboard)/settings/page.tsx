'use client';

import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'motion/react';
import { Logo } from '@/components/Logo';
import { NotificationSettings, defaultNotificationSettings } from '@/lib/notificationService';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'about'>('general');
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(defaultNotificationSettings);

  useEffect(() => {
    setMounted(true);
    
    const loadSettings = async () => {
      if (user && !user.isAnonymous) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.notificationSettings) {
            setNotificationSettings(userData.notificationSettings);
          }
        }
      }
    };
    loadSettings();
  }, [user]);

  const updateNotificationSettings = async (newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...notificationSettings, ...newSettings };
    setNotificationSettings(updatedSettings);

    if (user && !user.isAnonymous) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { notificationSettings: updatedSettings }, { merge: true });
    }
  };

  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme);
    
    if (user && !user.isAnonymous) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { preferences: { theme: newTheme } }, { merge: true });
      } catch (error) {
        console.error('Failed to save theme preference', error);
      }
    }
  };

  return (
    <div className="p-4 md:p-8 min-h-full flex flex-col max-w-3xl mx-auto w-full">
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-dark-text-primary">Settings</h1>
        <p className="text-slate-500 dark:text-dark-text-secondary text-sm mt-1">Configure your Pilot and app preferences.</p>
      </div>

      <div className="flex gap-6 border-b border-slate-200 dark:border-dark-divider mb-8">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-3 font-medium transition-colors relative ${activeTab === 'general' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-800 dark:text-dark-text-secondary dark:hover:text-dark-text-primary'}`}
        >
          General
          {activeTab === 'general' && (
            <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full"></motion.div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`pb-3 font-medium transition-colors relative ${activeTab === 'about' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-800 dark:text-dark-text-secondary dark:hover:text-dark-text-primary'}`}
        >
          About
          {activeTab === 'about' && (
            <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full"></motion.div>
          )}
        </button>
      </div>

      {activeTab === 'general' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-dark-secondary border border-slate-100 dark:border-dark-border rounded-3xl p-6 shadow-sm space-y-8 transition-colors duration-300"
        >
          <div>
            <h3 className="font-bold text-slate-800 dark:text-dark-text-primary mb-4 border-b border-slate-100 dark:border-dark-divider pb-2">Pilot Preferences</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium text-slate-800 dark:text-dark-text-primary">Proactive Suggestions</p>
                  <p className="text-sm text-slate-500 dark:text-dark-text-secondary">Allow Pilot to suggest schedule changes automatically.</p>
                </div>
                <div className="relative">
                  <input type="checkbox" className="sr-only" defaultChecked />
                  <div className="block bg-blue-600 w-10 h-6 rounded-full"></div>
                  <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform translate-x-4"></div>
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium text-slate-800 dark:text-dark-text-primary">Strict Focus Mode</p>
                  <p className="text-sm text-slate-500 dark:text-dark-text-secondary">Pilot will block non-urgent notifications during sessions.</p>
                </div>
                <div className="relative">
                  <input type="checkbox" className="sr-only" defaultChecked />
                  <div className="block bg-blue-600 w-10 h-6 rounded-full"></div>
                  <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform translate-x-4"></div>
                </div>
              </label>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 dark:text-dark-text-primary mb-4 border-b border-slate-100 dark:border-dark-divider pb-2">Notifications</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium text-slate-800 dark:text-dark-text-primary">Enable Notifications</p>
                  <p className="text-sm text-slate-500 dark:text-dark-text-secondary">Receive browser notifications.</p>
                </div>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={notificationSettings.enabled} 
                    onChange={(e) => updateNotificationSettings({ enabled: e.target.checked })}
                  />
                  <div className={`block w-10 h-6 rounded-full ${notificationSettings.enabled ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${notificationSettings.enabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium text-slate-800 dark:text-dark-text-primary">AI Smart Reminders</p>
                  <p className="text-sm text-slate-500 dark:text-dark-text-secondary">Let Pilot calculate optimal reminder times.</p>
                </div>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={notificationSettings.aiSmartReminders} 
                    onChange={(e) => updateNotificationSettings({ aiSmartReminders: e.target.checked })}
                  />
                  <div className={`block w-10 h-6 rounded-full ${notificationSettings.aiSmartReminders ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${notificationSettings.aiSmartReminders ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
              </label>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 dark:text-dark-text-primary mb-4 border-b border-slate-100 dark:border-dark-divider pb-2">Appearance</h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-3">
                <p className="font-medium text-slate-800 dark:text-dark-text-primary">Theme</p>
                <p className="text-sm text-slate-500 dark:text-dark-text-secondary mb-2">Choose how TaskPilot AI looks to you.</p>
                
                <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => handleThemeChange('light')}
                    className={`flex flex-col items-center justify-center py-4 rounded-xl border-2 transition-all ${mounted && theme === 'light' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-dark-border hover:border-slate-300 dark:hover:border-slate-600'}`}
                  >
                    <span className="text-2xl mb-2">☀️</span>
                    <span className={`text-sm font-medium ${mounted && theme === 'light' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-dark-text-secondary'}`}>Light</span>
                  </button>
                  <button 
                    onClick={() => handleThemeChange('dark')}
                    className={`flex flex-col items-center justify-center py-4 rounded-xl border-2 transition-all ${mounted && theme === 'dark' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-dark-border hover:border-slate-300 dark:hover:border-slate-600'}`}
                  >
                    <span className="text-2xl mb-2">🌙</span>
                    <span className={`text-sm font-medium ${mounted && theme === 'dark' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-dark-text-secondary'}`}>Dark</span>
                  </button>
                  <button 
                    onClick={() => handleThemeChange('system')}
                    className={`flex flex-col items-center justify-center py-4 rounded-xl border-2 transition-all ${mounted && theme === 'system' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-dark-border hover:border-slate-300 dark:hover:border-slate-600'}`}
                  >
                    <span className="text-2xl mb-2">📱</span>
                    <span className={`text-sm font-medium ${mounted && theme === 'system' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-dark-text-secondary'}`}>System</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'about' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* App Information */}
          <div className="bg-white dark:bg-dark-secondary border border-slate-100 dark:border-dark-border rounded-3xl p-6 shadow-sm transition-colors duration-300">
            <div className="flex items-center gap-4 mb-4">
              <Logo className="w-16 h-16 rounded-2xl shadow-lg shrink-0" />
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-dark-text-primary">TaskPilot AI</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="px-2 py-1 bg-slate-100 dark:bg-dark-elevated text-slate-600 dark:text-dark-text-secondary text-xs font-semibold rounded-lg">Version 1.0.0</span>
                  <span className="px-2 py-1 bg-slate-100 dark:bg-dark-elevated text-slate-600 dark:text-dark-text-secondary text-xs font-semibold rounded-lg">Build 2026.06</span>
                </div>
              </div>
            </div>
            <p className="text-slate-600 dark:text-dark-text-secondary leading-relaxed">
              TaskPilot AI is an AI-powered productivity companion that helps users intelligently plan, prioritize, schedule, and complete tasks before deadlines through personalized AI assistance.
            </p>
          </div>

          {/* Features */}
          <div className="bg-white dark:bg-dark-secondary border border-slate-100 dark:border-dark-border rounded-3xl p-6 shadow-sm transition-colors duration-300">
            <h3 className="font-bold text-slate-800 dark:text-dark-text-primary mb-4 border-b border-slate-100 dark:border-dark-divider pb-2">Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'AI Task Planning',
                'Smart Scheduling',
                'Pilot Chat',
                'Pilot Insights',
                'Habit Tracking',
                'Goal Management',
                'Productivity Analytics',
                'Smart Notifications',
                'Cloud Sync',
                'Guest Mode'
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-700 dark:text-dark-text-secondary">
                  <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Developer */}
          <div className="bg-white dark:bg-dark-secondary border border-slate-100 dark:border-dark-border rounded-3xl p-6 shadow-sm transition-colors duration-300">
            <h3 className="font-bold text-slate-800 dark:text-dark-text-primary mb-4 border-b border-slate-100 dark:border-dark-divider pb-2">Developer</h3>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-slate-500 dark:text-dark-text-secondary">Developed by</span>
              <span className="text-lg font-bold text-slate-900 dark:text-dark-text-primary">Ritwij</span>
              <p className="text-sm text-slate-600 dark:text-dark-text-secondary mt-2 italic">
                &ldquo;Designed and developed with ❤️ to help people become more productive.&rdquo;
              </p>
            </div>
          </div>

          {/* Technologies Used */}
          <div className="bg-white dark:bg-dark-secondary border border-slate-100 dark:border-dark-border rounded-3xl p-6 shadow-sm transition-colors duration-300">
            <h3 className="font-bold text-slate-800 dark:text-dark-text-primary mb-4 border-b border-slate-100 dark:border-dark-divider pb-2">Technologies Used</h3>
            <div className="flex flex-wrap gap-2">
              {[
                'Next.js',
                'React',
                'TypeScript',
                'Tailwind CSS',
                'Firebase Authentication',
                'Cloud Firestore',
                'Gemini AI',
                'Google Cloud'
              ].map((tech, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-xl border border-blue-100 dark:border-blue-900/40">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Useful Links */}
          <div className="bg-white dark:bg-dark-secondary border border-slate-100 dark:border-dark-border rounded-3xl p-6 shadow-sm transition-colors duration-300">
            <h3 className="font-bold text-slate-800 dark:text-dark-text-primary mb-4 border-b border-slate-100 dark:border-dark-divider pb-2">Useful Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-slate-50 dark:bg-dark-elevated rounded-xl hover:bg-slate-100 dark:hover:bg-dark-divider transition-colors text-slate-700 dark:text-dark-text-primary text-sm font-medium">
                <span>Privacy Policy</span>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-slate-50 dark:bg-dark-elevated rounded-xl hover:bg-slate-100 dark:hover:bg-dark-divider transition-colors text-slate-700 dark:text-dark-text-primary text-sm font-medium">
                <span>Terms & Conditions</span>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-slate-50 dark:bg-dark-elevated rounded-xl hover:bg-slate-100 dark:hover:bg-dark-divider transition-colors text-slate-700 dark:text-dark-text-primary text-sm font-medium">
                <span>GitHub Repository</span>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-slate-50 dark:bg-dark-elevated rounded-xl hover:bg-slate-100 dark:hover:bg-dark-divider transition-colors text-slate-700 dark:text-dark-text-primary text-sm font-medium">
                <span>Contact Support</span>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              </a>
            </div>
          </div>

          {/* Credits */}
          <div className="text-center py-4">
            <p className="text-sm font-medium text-slate-500 dark:text-dark-text-secondary">Powered by Google Gemini AI and Firebase.</p>
          </div>
          
          {/* Footer */}
          <div className="text-center pt-4 pb-8 border-t border-slate-200 dark:border-dark-divider">
            <p className="text-sm font-bold text-slate-800 dark:text-dark-text-primary mb-1">© 2026 TaskPilot AI</p>
            <p className="text-sm text-slate-500 dark:text-dark-text-secondary">Made with ❤️ by Ritwij</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

