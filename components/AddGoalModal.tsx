'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';
import { DataService } from '@/lib/dataService';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalAdded: () => void;
}

export function AddGoalModal({ isOpen, onClose, onGoalAdded }: AddGoalModalProps) {
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Career');
  const [targetDate, setTargetDate] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);

  if (!isOpen) return null;

  const handleGetAiSuggestions = async () => {
    if (!title.trim()) return;
    setIsAiLoading(true);
    setAiSuggestions(null);
    try {
      const res = await fetch('/api/ai/goal-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, category, targetDate })
      });
      const data = await res.json();
      if (data) {
        setAiSuggestions(data);
      }
    } catch (error) {
      console.error('Error fetching AI goal plan', error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !user) return;
    
    setIsSaving(true);
    try {
      const goalId = crypto.randomUUID();
      
      const newMilestones = aiSuggestions?.milestones 
        ? aiSuggestions.milestones.map((m: string) => ({ id: crypto.randomUUID(), title: m, completed: false }))
        : [];
      
      const newGoal = {
        id: goalId,
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        targetDate: targetDate || undefined,
        progress: 0,
        milestones: newMilestones,
        strategy: aiSuggestions?.strategy || undefined,
        createdAt: new Date().toISOString()
      };

      await DataService.saveItem('goals', goalId, newGoal, user.uid, user.isAnonymous);
      
      setTitle('');
      setDescription('');
      setAiSuggestions(null);
      
      onGoalAdded();
      onClose();
    } catch (error) {
      console.error('Error saving goal', error);
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
          className="bg-white dark:bg-dark-secondary rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col relative z-10 border border-slate-100 dark:border-dark-border overflow-hidden"
        >
          <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-dark-divider shrink-0">
            <h2 className="text-xl font-bold text-slate-800 dark:text-dark-text-primary">New Goal</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-dark-divider rounded-full text-slate-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              <div className="space-y-6">
                <div>
                  <input
                    type="text"
                    placeholder="Goal Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-2xl font-bold bg-transparent border-b-2 border-transparent hover:border-slate-200 dark:hover:border-dark-divider focus:border-blue-500 focus:outline-none px-2 py-2 text-slate-800 dark:text-dark-text-primary placeholder:text-slate-300 dark:placeholder:text-slate-600 transition-colors"
                    autoFocus
                  />
                </div>

                <div>
                  <textarea
                    placeholder="Why is this goal important to you?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-50 dark:bg-dark-elevated border border-slate-200 dark:border-dark-divider rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-dark-text-primary focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-dark-text-secondary mb-2">Category</label>
                    <select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-dark-elevated border border-slate-200 dark:border-dark-divider rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-dark-text-primary focus:outline-none focus:border-blue-500"
                    >
                      <option value="Career">Career</option>
                      <option value="Health">Health</option>
                      <option value="Finance">Finance</option>
                      <option value="Personal">Personal</option>
                      <option value="Education">Education</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-dark-text-secondary mb-2">Target Date</label>
                    <input 
                      type="date" 
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-dark-elevated border border-slate-200 dark:border-dark-divider rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-dark-text-primary focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* AI Goal Strategist Column */}
              <div className="space-y-4">
                <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-5 shadow-sm h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-md">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-dark-text-primary text-sm">Goal Strategist</h3>
                      <p className="text-xs text-slate-500 dark:text-orange-400/80">Let AI build your roadmap</p>
                    </div>
                  </div>
                  
                  <button 
                    type="button"
                    onClick={handleGetAiSuggestions}
                    disabled={isAiLoading || !title.trim()}
                    className="w-full py-2.5 bg-white dark:bg-dark-secondary border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 font-semibold rounded-xl text-sm shadow-sm hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors disabled:opacity-50"
                  >
                    {isAiLoading ? 'Analyzing...' : 'Generate Action Plan'}
                  </button>

                  {aiSuggestions && (
                    <div className="mt-4 space-y-4">
                      {aiSuggestions.deadlineWarning && (
                         <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 text-xs font-semibold">
                           ⚠️ {aiSuggestions.deadlineWarning}
                         </div>
                      )}
                      
                      <div className="text-sm">
                        <strong className="text-slate-800 dark:text-dark-text-primary block mb-1">Execution Strategy</strong>
                        <p className="text-slate-600 dark:text-dark-text-secondary bg-white dark:bg-dark-secondary p-3 rounded-xl border border-orange-100 dark:border-orange-900/20">{aiSuggestions.strategy}</p>
                      </div>
                      
                      <div className="text-sm">
                        <strong className="text-slate-800 dark:text-dark-text-primary block mb-1">Generated Milestones</strong>
                        <ul className="space-y-2">
                          {aiSuggestions.milestones.map((m: string, i: number) => (
                            <li key={i} className="flex gap-2 bg-white dark:bg-dark-secondary p-2.5 rounded-xl border border-orange-100 dark:border-orange-900/20 text-slate-600 dark:text-dark-text-secondary items-start">
                              <span className="w-5 h-5 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">{i+1}</span>
                              <span className="text-sm">{m}</span>
                            </li>
                          ))}
                        </ul>
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
              {isSaving ? 'Saving...' : 'Save Goal'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
