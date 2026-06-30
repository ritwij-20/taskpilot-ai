'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';
import { DataService } from '@/lib/dataService';
import { AddHabitModal } from '@/components/AddHabitModal';

const COLORS = [
  'bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-orange-400', 'bg-pink-400'
];

export default function HabitsPage() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newColor, setNewColor] = useState(COLORS[0]);

  const loadHabits = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await DataService.getItems('habits', user.uid, user.isAnonymous);
      setHabits(data);
    } catch (error) {
      console.error("Error loading habits", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTitle.trim()) return;

    const newHabit = {
      title: newTitle.trim(),
      color: newColor,
      progress: 0,
      createdAt: new Date().toISOString()
    };

    try {
      const id = crypto.randomUUID();
      await DataService.saveItem('habits', id, newHabit, user.uid, user.isAnonymous);
      setShowModal(false);
      setNewTitle('');
      setNewColor(COLORS[0]);
      loadHabits();
    } catch (error) {
      console.error("Error creating habit", error);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (!user) return;
    try {
      await DataService.deleteItem('habits', habitId, user.uid, user.isAnonymous);
      loadHabits();
    } catch (error) {
      console.error("Error deleting habit", error);
    }
  };

  if (loading) {
    return <div className="p-4 md:p-8 flex justify-center items-center h-full"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto min-h-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-dark-text-primary">Habits</h1>
          <p className="text-slate-500 dark:text-dark-text-secondary text-sm mt-1">Build positive routines day by day.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          + New Habit
        </button>
      </div>

      {habits.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-dark-secondary rounded-[24px] border border-slate-100 dark:border-dark-border p-12 text-center shadow-sm transition-colors duration-300"
        >
          {/* Icon with Sparkles */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-3xl flex items-center justify-center">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            {/* Sparkles */}
            <span className="absolute -top-2 -right-2 text-blue-400 animate-pulse">✨</span>
            <span className="absolute -bottom-1 -left-2 text-blue-300 animate-pulse delay-75">✨</span>
          </div>

          <h3 className="text-2xl font-bold text-slate-900 dark:text-dark-text-primary mb-3">No habits yet</h3>
          <p className="text-slate-500 dark:text-dark-text-secondary mb-8 max-w-sm mx-auto leading-relaxed">
            You haven't created any habits yet.<br />
            Start building positive routines and let Pilot AI help you stay consistent and track your progress.
          </p>
          <button 
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
            Create Your First Habit
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {habits.map((habit) => (
            <div key={habit.id} className="bg-white dark:bg-dark-secondary border border-slate-100 dark:border-dark-border rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 cursor-pointer group">
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${habit.color} text-white shadow-sm`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <button 
                  onClick={() => handleDeleteHabit(habit.id)}
                  className="text-slate-400 dark:text-dark-text-muted hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
              
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-dark-text-primary mb-1">{habit.title}</h3>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-700 dark:text-dark-text-secondary">Progress</span>
                  <span className="font-bold text-slate-900 dark:text-dark-text-primary">{habit.progress || 0}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-dark-divider rounded-full overflow-hidden">
                  <div className={`h-full ${habit.color} rounded-full transition-all duration-500`} style={{ width: `${habit.progress || 0}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AddHabitModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onHabitAdded={() => {
          setShowModal(false);
          loadHabits();
        }}
      />
    </div>
  );
}
