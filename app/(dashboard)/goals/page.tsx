'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DataService } from '@/lib/dataService';
import { AddGoalModal } from '@/components/AddGoalModal';

export default function GoalsPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDays, setNewDays] = useState(30);
  const [newMilestones, setNewMilestones] = useState(5);

  const loadGoals = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await DataService.getItems('goals', user.uid, user.isAnonymous);
      setGoals(data);
    } catch (error) {
      console.error("Error loading goals", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTitle.trim()) return;

    const newGoal = {
      title: newTitle.trim(),
      daysRemaining: newDays,
      milestonesHit: 0,
      totalMilestones: newMilestones,
      progress: 0,
      createdAt: new Date().toISOString()
    };

    try {
      const id = crypto.randomUUID();
      await DataService.saveItem('goals', id, newGoal, user.uid, user.isAnonymous);
      setShowModal(false);
      setNewTitle('');
      setNewDays(30);
      setNewMilestones(5);
      loadGoals();
    } catch (error) {
      console.error("Error creating goal", error);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!user) return;
    try {
      await DataService.deleteItem('goals', goalId, user.uid, user.isAnonymous);
      loadGoals();
    } catch (error) {
      console.error("Error deleting goal", error);
    }
  };

  if (loading) {
    return <div className="p-4 md:p-8 flex justify-center items-center h-full"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto min-h-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-dark-text-primary">Goals</h1>
          <p className="text-slate-500 dark:text-dark-text-secondary text-sm mt-1">Track your long-term objectives and milestones.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          + New Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="bg-white dark:bg-dark-secondary rounded-3xl border border-slate-100 dark:border-dark-border p-12 text-center shadow-sm transition-colors duration-300">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-dark-text-primary mb-2">No goals set</h3>
          <p className="text-slate-500 dark:text-dark-text-secondary mb-6 max-w-md mx-auto">You haven't set any long-term goals yet. Define your objectives to let your AI Pilot help you achieve them.</p>
          <button 
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-slate-900 dark:bg-blue-600 text-white rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors shadow-sm"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => (
            <div key={goal.id} className="group bg-white dark:bg-dark-secondary border border-slate-100 dark:border-dark-border rounded-3xl p-6 shadow-sm flex flex-col justify-center relative overflow-hidden transition-colors duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-dark-text-secondary">Goal</p>
                    <h3 className="font-bold text-slate-900 dark:text-dark-text-primary truncate max-w-[200px]">{goal.title}</h3>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteGoal(goal.id)}
                  className="text-slate-400 dark:text-dark-text-muted hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                  title="Delete Goal"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-black text-slate-900 dark:text-dark-text-primary mb-1">{goal.daysRemaining} days</p>
                  <p className="text-sm text-slate-500 dark:text-dark-text-secondary">remaining</p>
                </div>
                <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-100 dark:text-dark-divider" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                    <path className="text-orange-500" strokeDasharray={`${goal.progress || 0}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-[10px] font-bold text-slate-800 dark:text-dark-text-primary">{goal.milestonesHit}/{goal.totalMilestones}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="bg-white dark:bg-dark-secondary rounded-3xl p-6 w-full max-w-md relative z-10 shadow-xl border dark:border-dark-border">
            <h2 className="text-xl font-bold text-slate-900 dark:text-dark-text-primary mb-6">New Goal</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-1">Goal Title</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-dark-elevated border border-slate-200 dark:border-dark-divider rounded-xl px-4 py-3 text-slate-800 dark:text-dark-text-primary outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400"
                  placeholder="e.g. Launch Beta"
                  autoFocus
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-1">Days Remaining</label>
                  <input 
                    type="number" 
                    value={newDays}
                    onChange={(e) => setNewDays(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-dark-elevated border border-slate-200 dark:border-dark-divider rounded-xl px-4 py-3 text-slate-800 dark:text-dark-text-primary outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary mb-1">Milestones</label>
                  <input 
                    type="number" 
                    value={newMilestones}
                    onChange={(e) => setNewMilestones(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-dark-elevated border border-slate-200 dark:border-dark-divider rounded-xl px-4 py-3 text-slate-800 dark:text-dark-text-primary outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400"
                    min="1"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 text-slate-600 dark:text-dark-text-secondary font-medium hover:bg-slate-50 dark:hover:bg-dark-elevated rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
