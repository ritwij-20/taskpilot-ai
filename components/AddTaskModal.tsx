'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, Subtask } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { DataService } from '@/lib/dataService';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskAdded: () => void;
}

export function AddTaskModal({ isOpen, onClose, onTaskAdded }: AddTaskModalProps) {
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [category, setCategory] = useState<Task['category']>('Work');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [recurring, setRecurring] = useState<Task['recurring']>('none');
  const [reminder, setReminder] = useState(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [notes, setNotes] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      setSubtasks([...subtasks, { id: crypto.randomUUID(), title: newSubtaskTitle.trim(), completed: false }]);
      setNewSubtaskTitle('');
    }
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(st => st.id !== id));
  };

  const handleGetAiSuggestions = async () => {
    if (!title.trim()) return;
    setIsAiLoading(true);
    setAiSuggestions(null);
    try {
      const res = await fetch('/api/ai/task-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, category, priority })
      });
      const data = await res.json();
      if (data.suggestion) {
        setAiSuggestions(data.suggestion);
        if (data.subtasks && data.subtasks.length > 0) {
            setSubtasks(prev => [
                ...prev, 
                ...data.subtasks.map((t: string) => ({ id: crypto.randomUUID(), title: t, completed: false }))
            ]);
        }
        if (data.priority) setPriority(data.priority);
        if (data.estimatedTime) setEstimatedTime(data.estimatedTime);
      }
    } catch (error) {
      console.error('Error fetching AI suggestions', error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !user) return;
    
    setIsSaving(true);
    try {
      const taskId = crypto.randomUUID();
      const newTask: Task = {
        id: taskId,
        title: title.trim(),
        description: description.trim() || undefined,
        status: 'todo',
        priority,
        category,
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
        estimatedTime: estimatedTime || undefined,
        recurring,
        reminder,
        subtasks: subtasks.length > 0 ? subtasks : undefined,
        notes: notes.trim() || undefined,
        createdAt: new Date().toISOString()
      };

      await DataService.saveItem('tasks', taskId, newTask, user.uid, user.isAnonymous);
      
      setTitle('');
      setDescription('');
      setSubtasks([]);
      setAiSuggestions(null);
      
      onTaskAdded();
      onClose();
    } catch (error) {
      console.error('Error saving task', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="bg-white dark:bg-dark-secondary rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative z-10 border border-slate-100 dark:border-dark-border overflow-hidden"
        >
          <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-dark-divider shrink-0">
            <h2 className="text-xl font-bold text-slate-800 dark:text-dark-text-primary">New Task</h2>
            <button onClick={onClose} className="p-2 bg-slate-50 dark:bg-dark-elevated hover:bg-slate-100 dark:hover:bg-dark-divider rounded-full text-slate-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <input
                    type="text"
                    placeholder="Task Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-2xl font-bold bg-transparent border-b-2 border-transparent hover:border-slate-200 dark:hover:border-dark-divider focus:border-blue-500 focus:outline-none px-2 py-2 text-slate-800 dark:text-dark-text-primary placeholder:text-slate-300 dark:placeholder:text-slate-600 transition-colors"
                    autoFocus
                  />
                </div>

                <div>
                  <textarea
                    placeholder="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-50 dark:bg-dark-elevated border border-slate-200 dark:border-dark-divider rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-dark-text-primary placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-dark-text-secondary uppercase tracking-wider mb-2">Priority</label>
                    <select 
                      value={priority} 
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-dark-elevated border border-slate-200 dark:border-dark-divider rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-dark-text-primary focus:outline-none focus:border-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-dark-text-secondary uppercase tracking-wider mb-2">Category</label>
                    <select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-dark-elevated border border-slate-200 dark:border-dark-divider rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-dark-text-primary focus:outline-none focus:border-blue-500"
                    >
                      <option value="Work">Work</option>
                      <option value="Study">Study</option>
                      <option value="Personal">Personal</option>
                      <option value="Health">Health</option>
                      <option value="Finance">Finance</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-dark-text-secondary uppercase tracking-wider mb-2">Due Date</label>
                    <input 
                      type="date" 
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-dark-elevated border border-slate-200 dark:border-dark-divider rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-dark-text-primary focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-dark-text-secondary uppercase tracking-wider mb-2">Due Time</label>
                    <input 
                      type="time" 
                      value={dueTime}
                      onChange={(e) => setDueTime(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-dark-elevated border border-slate-200 dark:border-dark-divider rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-dark-text-primary focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-dark-text-secondary uppercase tracking-wider mb-2">Subtasks</label>
                  <div className="space-y-2 mb-3">
                    {subtasks.map(st => (
                      <div key={st.id} className="flex items-center justify-between bg-slate-50 dark:bg-dark-elevated p-2.5 rounded-lg border border-slate-200 dark:border-dark-divider">
                        <span className="text-sm text-slate-700 dark:text-dark-text-primary pl-2">{st.title}</span>
                        <button onClick={() => handleRemoveSubtask(st.id)} className="text-red-500 hover:text-red-600 p-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a subtask..."
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                      className="flex-1 bg-slate-50 dark:bg-dark-elevated border border-slate-200 dark:border-dark-divider rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-dark-text-primary placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                    />
                    <button 
                      type="button" 
                      onClick={handleAddSubtask}
                      className="px-4 py-2 bg-slate-100 dark:bg-dark-elevated text-slate-700 dark:text-dark-text-primary font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-dark-divider transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-dark-text-secondary uppercase tracking-wider mb-2">Estimated Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 2 hours"
                      value={estimatedTime}
                      onChange={(e) => setEstimatedTime(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-dark-elevated border border-slate-200 dark:border-dark-divider rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-dark-text-primary placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-dark-text-secondary uppercase tracking-wider mb-2">Recurring</label>
                    <select 
                      value={recurring} 
                      onChange={(e) => setRecurring(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-dark-elevated border border-slate-200 dark:border-dark-divider rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-dark-text-primary focus:outline-none focus:border-blue-500"
                    >
                      <option value="none">None</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* AI Smart Planner Column */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-dark-text-primary text-sm">AI Smart Planner</h3>
                      <p className="text-xs text-slate-500 dark:text-blue-400/80">Gemini-powered insights</p>
                    </div>
                  </div>
                  
                  <button 
                    type="button"
                    onClick={handleGetAiSuggestions}
                    disabled={isAiLoading || !title.trim()}
                    className="w-full py-2.5 bg-white dark:bg-dark-secondary border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 font-semibold rounded-xl text-sm shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50"
                  >
                    {isAiLoading ? 'Analyzing...' : 'Generate Plan'}
                  </button>

                  {aiSuggestions && (
                    <div className="mt-4 p-4 bg-white dark:bg-dark-secondary rounded-xl border border-blue-100 dark:border-blue-900/20 text-sm text-slate-700 dark:text-dark-text-secondary leading-relaxed">
                      {aiSuggestions}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-dark-text-secondary uppercase tracking-wider mb-2">Notes</label>
                  <textarea
                    placeholder="Additional context or links..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-50 dark:bg-dark-elevated border border-slate-200 dark:border-dark-divider rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-dark-text-primary placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>
              </div>

            </div>
          </div>

          <div className="p-6 border-t border-slate-100 dark:border-dark-divider flex justify-end gap-3 shrink-0 bg-slate-50 dark:bg-dark-secondary">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-slate-600 dark:text-dark-text-secondary hover:bg-slate-200 dark:hover:bg-dark-divider rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim() || isSaving}
              className="px-8 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 shadow-md transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Task'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
