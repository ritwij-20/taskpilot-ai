'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DataService } from '@/lib/dataService';

export default function CalendarPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Simple calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  
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
      console.error("Error loading tasks", error);
    } finally {
      setLoading(false);
    }
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const getTasksForDay = (day: number) => {
    return tasks.filter(t => {
      if (!t.createdAt) return false;
      const taskDate = new Date(t.createdAt);
      return taskDate.getDate() === day && 
             taskDate.getMonth() === currentDate.getMonth() && 
             taskDate.getFullYear() === currentDate.getFullYear();
    });
  };

  return (
    <div className="p-4 md:p-8 min-h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-dark-text-primary">Calendar</h1>
          <p className="text-slate-500 dark:text-dark-text-secondary text-sm mt-1">Plan your focus sessions and deadlines.</p>
        </div>
        <div className="flex items-center gap-4 bg-white dark:bg-dark-secondary border border-slate-200 dark:border-dark-border rounded-xl p-1 shadow-sm transition-colors duration-300">
          <button onClick={prevMonth} className="p-2 text-slate-600 dark:text-dark-text-secondary hover:bg-slate-50 dark:hover:bg-dark-elevated rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <span className="font-semibold text-slate-800 dark:text-dark-text-primary min-w-[120px] text-center">
            {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={nextMonth} className="p-2 text-slate-600 dark:text-dark-text-secondary hover:bg-slate-50 dark:hover:bg-dark-elevated rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-dark-secondary border border-slate-100 dark:border-dark-border rounded-3xl shadow-sm overflow-hidden flex flex-col transition-colors duration-300">
        <div className="grid grid-cols-7 border-b border-slate-100 dark:border-dark-border bg-slate-50 dark:bg-dark-elevated shrink-0">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-3 text-center text-xs font-semibold text-slate-500 dark:text-dark-text-secondary uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-y-auto">
          {paddingDays.map(day => (
            <div key={`padding-${day}`} className="border-b border-r border-slate-50 dark:border-dark-border bg-slate-50/50 dark:bg-transparent p-2 opacity-50 min-h-[100px]"></div>
          ))}
          {days.map(day => {
            const dayTasks = getTasksForDay(day);
            const isToday = day === new Date().getDate() && 
                            currentDate.getMonth() === new Date().getMonth() && 
                            currentDate.getFullYear() === new Date().getFullYear();
            
            return (
              <div key={day} className={`border-b border-r border-slate-100 dark:border-dark-border p-2 min-h-[100px] transition-colors hover:bg-slate-50 dark:hover:bg-dark-elevated ${isToday ? 'bg-blue-50/30 dark:bg-blue-900/10' : 'bg-white dark:bg-dark-secondary'}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white shadow-md' : 'text-slate-700 dark:text-dark-text-primary'}`}>
                    {day}
                  </span>
                </div>
                <div className="space-y-1 mt-2">
                  {dayTasks.slice(0, 3).map(task => (
                    <div key={task.id} className={`text-xs px-2 py-1 rounded-md truncate font-medium ${
                      task.status === 'completed' ? 'bg-slate-100 dark:bg-dark-divider text-slate-500 dark:text-dark-text-secondary line-through' :
                      task.priority === 'urgent' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/40' :
                      task.priority === 'high' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-100 dark:border-orange-900/40' :
                      'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40'
                    }`}>
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-slate-400 dark:text-dark-text-muted font-medium pl-1">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
