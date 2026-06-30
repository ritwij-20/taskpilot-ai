'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DataService } from '@/lib/dataService';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const tasksData = await DataService.getItems('tasks', user!.uid, user!.isAnonymous);
      setTasks(tasksData);
    } catch (error) {
      console.error("Error loading analytics data", error);
    } finally {
      setLoading(false);
    }
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const highPriorityCompleted = tasks.filter(t => t.status === 'completed' && (t.priority === 'high' || t.priority === 'urgent')).length;
  const totalHighPriority = tasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length;
  const highPriorityRate = totalHighPriority > 0 ? Math.round((highPriorityCompleted / totalHighPriority) * 100) : 0;

  return (
    <div className="p-4 md:p-8 min-h-full flex flex-col">
      <div className="mb-6 shrink-0 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-dark-text-primary">Analytics</h1>
          <p className="text-slate-500 dark:text-dark-text-secondary text-sm mt-1">Track your productivity trends and insights.</p>
        </div>
        <div className="px-4 py-2 bg-white dark:bg-dark-secondary border border-slate-200 dark:border-dark-border rounded-xl text-sm font-semibold text-slate-700 dark:text-dark-text-primary shadow-sm">
          Last 30 Days
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-dark-secondary p-6 rounded-3xl border border-slate-100 dark:border-dark-border shadow-sm transition-colors duration-300">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
          </div>
          <p className="text-sm text-slate-500 dark:text-dark-text-secondary font-medium mb-1">Overall Productivity</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-slate-800 dark:text-dark-text-primary">{completionRate}%</span>
            <span className="text-sm font-bold text-green-500 mb-1">+4%</span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-dark-secondary p-6 rounded-3xl border border-slate-100 dark:border-dark-border shadow-sm transition-colors duration-300">
          <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <p className="text-sm text-slate-500 dark:text-dark-text-secondary font-medium mb-1">High Priority Completion</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-slate-800 dark:text-dark-text-primary">{highPriorityRate}%</span>
            <span className="text-sm font-bold text-red-500 mb-1">-2%</span>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-secondary p-6 rounded-3xl border border-slate-100 dark:border-dark-border shadow-sm transition-colors duration-300">
          <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <p className="text-sm text-slate-500 dark:text-dark-text-secondary font-medium mb-1">Tasks Completed</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-slate-800 dark:text-dark-text-primary">{completedTasks}</span>
            <span className="text-sm font-medium text-slate-400 dark:text-dark-text-muted mb-1">/ {totalTasks} total</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        <div className="bg-white dark:bg-dark-secondary border border-slate-100 dark:border-dark-border rounded-3xl p-6 shadow-sm flex flex-col transition-colors duration-300">
          <h2 className="text-lg font-bold text-slate-800 dark:text-dark-text-primary mb-6">Activity Heatmap</h2>
          <div className="flex-1 flex flex-col justify-center gap-2">
            {/* Mock Heatmap */}
            {[...Array(5)].map((_, rowIndex) => (
              <div key={rowIndex} className="flex gap-2">
                {[...Array(12)].map((_, colIndex) => {
                  const intensity = Math.random();
                  let bgColor = 'bg-slate-100 dark:bg-dark-elevated';
                  if (intensity > 0.8) bgColor = 'bg-blue-600 dark:bg-blue-500';
                  else if (intensity > 0.5) bgColor = 'bg-blue-400 dark:bg-blue-600';
                  else if (intensity > 0.2) bgColor = 'bg-blue-200 dark:bg-blue-900/40';
                  
                  return (
                    <div key={colIndex} className={`w-full h-8 rounded-md ${bgColor} hover:opacity-80 transition-opacity cursor-pointer`} title="Activity level"></div>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end gap-2 mt-4 text-xs text-slate-500 dark:text-dark-text-secondary">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-slate-100 dark:bg-dark-elevated rounded-sm"></div>
              <div className="w-3 h-3 bg-blue-200 dark:bg-blue-900/40 rounded-sm"></div>
              <div className="w-3 h-3 bg-blue-400 dark:bg-blue-600 rounded-sm"></div>
              <div className="w-3 h-3 bg-blue-600 dark:bg-blue-500 rounded-sm"></div>
            </div>
            <span>More</span>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-secondary border border-slate-100 dark:border-dark-border rounded-3xl p-6 shadow-sm flex flex-col transition-colors duration-300">
          <h2 className="text-lg font-bold text-slate-800 dark:text-dark-text-primary mb-6">Pilot Insights</h2>
          <div className="space-y-4 flex-1">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/40">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <h3 className="font-bold text-blue-900 dark:text-blue-400">Peak Performance</h3>
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                You complete 65% of your high-priority tasks between 9:00 AM and 11:30 AM. Pilot recommends scheduling deep work during this window.
              </p>
            </div>
            
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-100 dark:border-orange-900/40">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <h3 className="font-bold text-orange-900 dark:text-orange-400">Attention Needed</h3>
              </div>
              <p className="text-sm text-orange-800 dark:text-orange-300 leading-relaxed">
                Your "Mindfulness" habit track rate has dropped to 20% this week. Would you like Pilot to block out 10 minutes each afternoon?
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
