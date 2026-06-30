'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';
import { DataService } from '@/lib/dataService';

const COLORS = [
  'bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-orange-400', 'bg-pink-400'
];

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHabitAdded: () => void;
}

export function AddHabitModal({ isOpen, onClose, onHabitAdded }: AddHabitModalProps) {
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [frequency, setFrequency] = useState('daily');
  const [targetDays, setTargetDays] = useState(7);
  const [isSaving, setIsSaving] = useState(false);

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);

  if (!isOpen) return null;

  const handleGetAiSuggestions = async () => {
    if (!title.trim()) return;
    setIsAiLoading(true);
    setAiSuggestions(null);
    try {
      const res = await fetch('/api/ai/habit-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, frequency })
      });
      const data = await res.json();
      if (data) {
        setAiSuggestions(data);
        if (data.recommendedFrequency) setFrequency(data.recommendedFrequency);
        if (data.targetDays) setTargetDays(data.targetDays);
      }
    } catch (error) {
      console.error('Error fetching AI habit plan', error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !user) return;
    
    setIsSaving(true);
    try {
      const habitId = crypto.randomUUID();
      const newHabit = {
        id: habitId,
        title: title.trim(),
        description: description.trim() || undefined,
        color,
        frequency,
        targetDays,
        currentStreak: 0,
        longestStreak: 0,
        createdAt: new Date().toISOString()
      };

      await DataService.saveItem('habits', habitId, newHabit, user.uid, user.isAnonymous);
      
      setTitle('');
      setDescription('');
      setAiSuggestions(null);
      
      onHabitAdded();
      onClose();
    } catch (error) {
      console.error('Error saving habit', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="bg-white dark:bg-dark-secondary rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative z-10 border border-slate-100 dark:border-dark-border overflow-hidden"
        >
          <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-dark-divider shrink-0">
            <h2 className="text-xl font-bold text-slate-800 dark:text-dark-text-primary">New Habit</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-dark-divider rounded-full text-slate-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <input
                    type="text"
                    placeholder="Habit Name"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-2xl font-bold bg-transparent border-b-2 border-transparent hover:border-slate-200 dark:hover:border-dark-divider focus:border-blue-500 focus:outline-none px-2 py-2 text-slate-800 dark:text-dark-text-primary placeholder:text-slate-300 dark:placeholder:text-slate-600 transition-colors"
                    autoFocus
                  />
                </div>

                <div>
                  <textarea
                    placeholder="Why are you building this habit?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-50 dark:bg-dark-elevated border border-slate-200 dark:border-dark-divider rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-dark-text-primary placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-dark-text-secondary mb-2">Frequency</label>
                    <select 
                      value={frequency} 
                      onChange={(e) => setFrequency(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-dark-elevated border border-slate-200 dark:border-dark-divider rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-dark-text-primary focus:outline-none focus:border-blue-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekdays">Weekdays</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-dark-text-secondary mb-2">Target Days (Streak Goal)</label>
                    <input 
                      type="number" 
                      value={targetDays}
                      onChange={(e) => setTargetDays(Number(e.target.value))}
                      min="1"
                      className="w-full bg-slate-50 dark:bg-dark-elevated border border-slate-200 dark:border-dark-divider rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-dark-text-primary focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-dark-text-secondary mb-2">Color Theme</label>
                  <div className="flex gap-3">
                    {COLORS.map(c => (
                      <button
                        key={c} type="button" onClick={() => setColor(c)}
                        className={`w-10 h-10 rounded-full ${c} shadow-sm border-2 transition-all flex items-center justify-center ${color === c ? 'border-slate-800 dark:border-white scale-110' : 'border-transparent hover:scale-110'}`}
                      >
                        {color === c && <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI AI Planner Column */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-md">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-dark-text-primary text-sm">Habit Coach</h3>
                      <p className="text-xs text-slate-500 dark:text-purple-400/80">Gemini-powered insights</p>
                    </div>
                  </div>
                  
                  <button 
                    type="button"
                    onClick={handleGetAiSuggestions}
                    disabled={isAiLoading || !title.trim()}
                    className="w-full py-2.5 bg-white dark:bg-dark-secondary border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 font-semibold rounded-xl text-sm shadow-sm hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors disabled:opacity-50"
                  >
                    {isAiLoading ? 'Analyzing...' : 'Get Success Strategy'}
                  </button>

                  {aiSuggestions && (
                    <div className="mt-4 space-y-3">
                      <div className="p-3 bg-white dark:bg-dark-secondary rounded-xl border border-purple-100 dark:border-purple-900/20 text-sm text-slate-700 dark:text-dark-text-secondary leading-relaxed">
                        <strong className="text-slate-800 dark:text-dark-text-primary">Strategy:</strong> {aiSuggestions.successStrategy}
                      </div>
                      <div className="p-3 bg-white dark:bg-dark-secondary rounded-xl border border-purple-100 dark:border-purple-900/20 text-sm text-slate-700 dark:text-dark-text-secondary leading-relaxed">
                        <strong className="text-slate-800 dark:text-dark-text-primary">Trigger:</strong> {aiSuggestions.habitTrigger}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          <div className="p-6 border-t border-slate-100 dark:border-dark-divider flex justify-end gap-3 bg-slate-50 dark:bg-dark-secondary shrink-0">
            <button onClick={onClose} className="px-6 py-2.5 text-sm font-medium text-slate-600 dark:text-dark-text-secondary hover:bg-slate-200 dark:hover:bg-dark-divider rounded-xl transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={!title.trim() || isSaving} className="px-8 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 shadow-md transition-colors disabled:opacity-50">
              {isSaving ? 'Saving...' : 'Save Habit'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
