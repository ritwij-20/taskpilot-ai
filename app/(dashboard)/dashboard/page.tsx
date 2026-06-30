'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DataService } from '@/lib/dataService';
import Link from 'next/link';
import { Task } from '@/types';
import { AddTaskModal } from '@/components/AddTaskModal';
import { AddHabitModal } from '@/components/AddHabitModal';
import { AddGoalModal } from '@/components/AddGoalModal';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '@/components/Logo';

const ONBOARDING_MESSAGES = [
  "Welcome to TaskPilot AI! 👋 You're all set to begin your productivity journey. Start by creating your first task, habit, or goal, and I'll help you organize everything.",
  "Looks like you're starting with a clean slate. Add your first task and I'll build a smart schedule to help you stay on track.",
  "Great to have you here! Create a goal or habit, and I'll generate personalized recommendations and an optimized daily plan.",
  "Your productivity dashboard is ready. Once you add a few tasks or goals, I'll provide intelligent insights, scheduling suggestions, and progress tracking.",
  "Every productive day starts with a plan. Add your first task, and I'll take care of prioritizing and scheduling it for you."
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal controls
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);

  // Pilot Insights dynamic state
  const [insights, setInsights] = useState<any>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [scheduleApplied, setScheduleApplied] = useState(false);
  const [onboardingMessage, setOnboardingMessage] = useState('');

  // Focus Timer state
  const [focusTimerActive, setFocusTimerActive] = useState(false);
  const [focusTimeLeft, setFocusTimeLeft] = useState(1500); // 25 mins
  const [selectedTaskForFocus, setSelectedTaskForFocus] = useState<string>('');
  const [showFocusCompleteModal, setShowFocusCompleteModal] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep track of previous data stringified to prevent unnecessary AI refetches
  const prevDataHashRef = useRef<string>('');

  useEffect(() => {
    // Pick a random onboarding message once on mount
    const randomIdx = Math.floor(Math.random() * ONBOARDING_MESSAGES.length);
    setOnboardingMessage(ONBOARDING_MESSAGES[randomIdx]);
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [user]);

  // Handle Pomodoro timer countdown
  useEffect(() => {
    if (focusTimerActive) {
      timerRef.current = setInterval(() => {
        setFocusTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setFocusTimerActive(false);
            handleFocusComplete();
            return 1500;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [focusTimerActive]);

  const loadData = async (forceInsightsRefresh = false) => {
    if (!user) return;
    try {
      if (tasks.length === 0 && habits.length === 0) {
        setLoading(true);
      }
      const [tasksData, habitsData, goalsData, preferencesData] = await Promise.all([
        DataService.getItems('tasks', user.uid, user.isAnonymous),
        DataService.getItems('habits', user.uid, user.isAnonymous),
        DataService.getItems('goals', user.uid, user.isAnonymous),
        DataService.getItem('user_preferences', 'schedule', user.uid, user.isAnonymous)
      ]);

      // Check if schedule was applied previously
      if (preferencesData && preferencesData.aiScheduleApplied) {
        setScheduleApplied(true);
      }

      // Sort by incomplete first, then by priority/date
      tasksData.sort((a, b) => {
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      const processedTasks = tasksData as Task[];
      setTasks(processedTasks);

      // Store authentic user habits and goals without fake placeholders
      setHabits(habitsData);
      setGoals(goalsData);

      // Automatically trigger AI Pilot Insights generation if data has changed
      const dataHash = JSON.stringify({ processedTasks, habitsData, goalsData });
      if (dataHash !== prevDataHashRef.current || forceInsightsRefresh) {
        prevDataHashRef.current = dataHash;
        if (processedTasks.length === 0 && habitsData.length === 0 && goalsData.length === 0) {
          setInsights(null);
        } else {
          fetchPilotInsights(processedTasks, habitsData, goalsData);
        }
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPilotInsights = async (currentTasks: Task[], currentHabits: any[], currentGoals: any[]) => {
    if (!user) return;
    try {
      setInsightsLoading(true);
      const response = await fetch('/api/ai/pilot-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: currentTasks,
          habits: currentHabits,
          goals: currentGoals,
          localTime: new Date().toISOString(),
          userEmail: user.email
        })
      });

      if (response.ok) {
        const data = await response.json();
        setInsights(data);
      } else {
        console.error('Failed to generate pilot insights:', response.statusText);
      }
    } catch (error) {
      console.error('Error requesting pilot insights:', error);
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleBuildMyDay = async () => {
    if (!user) return;
    setInsightsLoading(true);
    try {
      const startTasks = [
        { title: 'Define weekly milestones & high-impact goals', priority: 'high', category: 'Strategy', status: 'todo', createdAt: new Date().toISOString() },
        { title: 'Perform initial 25-minute Pomodoro focus block', priority: 'medium', category: 'Focus', status: 'todo', createdAt: new Date().toISOString() }
      ];
      const startHabits = [
        { title: 'Morning hydration & mindfulness check', progress: 0, color: 'bg-blue-400', createdAt: new Date().toISOString() },
        { title: 'Check daily smart Pilot schedule targets', progress: 0, color: 'bg-indigo-400', createdAt: new Date().toISOString() }
      ];

      await Promise.all([
        ...startTasks.map((t, idx) => DataService.saveItem('tasks', `starter-task-${idx}`, t, user.uid, user.isAnonymous)),
        ...startHabits.map((h, idx) => DataService.saveItem('habits', `starter-habit-${idx}`, h, user.uid, user.isAnonymous))
      ]);

      await loadData(true);
    } catch (e) {
      console.error('Error auto-generating starter items:', e);
    } finally {
      setInsightsLoading(false);
    }
  };

  const toggleTaskStatus = async (task: Task) => {
    if (!user) return;
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';

    // Optimistic local state update
    setTasks(tasks.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)));

    try {
      await DataService.saveItem('tasks', task.id, { status: newStatus }, user.uid, user.isAnonymous);
      await loadData(true);
    } catch (error) {
      console.error('Error updating task status:', error);
      loadData(); // revert
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    // Optimistic local state update
    setTasks(tasks.filter((t) => t.id !== taskId));
    try {
      await DataService.deleteItem('tasks', taskId, user.uid, user.isAnonymous);
      await loadData(true);
    } catch (error) {
      console.error('Error deleting task:', error);
      loadData();
    }
  };

  // Increment habit progress interactively (cycles through increments of 25% to complete it)
  const incrementHabitProgress = async (habit: any) => {
    if (!user) return;
    const currentProgress = habit.progress || 0;
    const newProgress = currentProgress >= 100 ? 0 : currentProgress + 25;

    // Optimistic local state update
    setHabits(habits.map((h) => (h.id === habit.id ? { ...h, progress: newProgress } : h)));

    try {
      await DataService.saveItem('habits', habit.id, { progress: newProgress }, user.uid, user.isAnonymous);
      await loadData(true);
    } catch (error) {
      console.error('Error updating habit progress:', error);
      loadData();
    }
  };

  // Triggered when clicking "Apply AI Schedule"
  const handleApplyAiSchedule = async () => {
    if (!user) return;
    try {
      const isReversing = scheduleApplied;
      setScheduleApplied(!isReversing);

      // Persist preferences to user preferences in Firestore/localStorage
      await DataService.saveItem(
        'user_preferences',
        'schedule',
        {
          aiScheduleApplied: !isReversing,
          appliedAt: new Date().toISOString()
        },
        user.uid,
        user.isAnonymous
      );

      // Force refresh data to trigger animation/insights recalculation
      await loadData(true);
    } catch (error) {
      console.error('Error applying AI schedule:', error);
    }
  };

  const scrollToPlan = () => {
    const element = document.getElementById('todays-pilot-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Pomodoro controls
  const toggleFocusTimer = () => {
    setFocusTimerActive(!focusTimerActive);
  };

  const resetFocusTimer = () => {
    setFocusTimerActive(false);
    setFocusTimeLeft(1500);
  };

  const skipFocusTimer = () => {
    setFocusTimerActive(false);
    handleFocusComplete();
  };

  const handleFocusComplete = async () => {
    setFocusTimeLeft(1500);
    setShowFocusCompleteModal(true);

    if (user) {
      const sessionId = crypto.randomUUID();
      try {
        // Save completed focus session event
        await DataService.saveItem(
          'focus_sessions',
          sessionId,
          {
            durationMinutes: 25,
            completedAt: new Date().toISOString(),
            taskId: selectedTaskForFocus || null
          },
          user.uid,
          user.isAnonymous
        );

        // If a task was selected for focus, mark it complete!
        if (selectedTaskForFocus) {
          const focusedTask = tasks.find((t) => t.id === selectedTaskForFocus);
          if (focusedTask && focusedTask.status !== 'completed') {
            await toggleTaskStatus(focusedTask);
          }
        } else {
          await loadData(true);
        }
      } catch (e) {
        console.error('Error saving focus session:', e);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isOnboarding = !loading && tasks.length === 0 && habits.length === 0 && goals.length === 0;

  return (
    <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 md:gap-6 min-h-full relative overflow-y-auto pb-16">
      
      {/* Modal Components */}
      <AddTaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onTaskAdded={() => {
          setShowTaskModal(false);
          loadData(true);
        }}
      />

      <AddHabitModal
        isOpen={showHabitModal}
        onClose={() => setShowHabitModal(false)}
        onHabitAdded={() => {
          setShowHabitModal(false);
          loadData(true);
        }}
      />

      <AddGoalModal
        isOpen={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        onGoalAdded={() => {
          setShowGoalModal(false);
          loadData(true);
        }}
      />

      {/* Cognitive Analysis Modal */}
      <AnimatePresence>
        {showExplanation && insights && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-dark-secondary rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-100 dark:border-dark-border space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-dark-divider">
                <h3 className="text-lg font-bold text-slate-800 dark:text-dark-text-primary flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"></path>
                  </svg>
                  Cognitive Coach Rationale
                </h3>
                <button
                  onClick={() => setShowExplanation(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-dark-text-primary p-1.5 rounded-full hover:bg-slate-50 dark:hover:bg-dark-divider transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              <p className="text-sm text-slate-600 dark:text-dark-text-secondary leading-relaxed whitespace-pre-wrap">
                {insights.explanation}
              </p>
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowExplanation(false)}
                  className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 shadow-md transition-all active:scale-95"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Focus Timer Complete Splash */}
      <AnimatePresence>
        {showFocusCompleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-dark-secondary rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-slate-100 dark:border-dark-border text-center space-y-4"
            >
              <div className="w-16 h-16 bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto text-3xl font-bold animate-bounce shadow-md">
                ✓
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-dark-text-primary">Focus Session Completed!</h3>
              <p className="text-sm text-slate-600 dark:text-dark-text-secondary leading-relaxed">
                Incredible work! You logged a complete 25-minute Pomodoro sprint. Your tasks, habits, and AI Pilot timeline have been fully updated.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setShowFocusCompleteModal(false)}
                  className="w-full py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 shadow-md transition-colors active:scale-95"
                >
                  Keep Slaying Goals
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pilot Insights Dynamic cockpit */}
      <section className="md:col-span-2 xl:col-span-8 bg-white dark:bg-dark-secondary border border-slate-100 dark:border-dark-border rounded-3xl p-6 shadow-sm flex flex-col gap-6 transition-all duration-300">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Animated Glowing Pilot Orb */}
          <div className="relative shrink-0">
            <Logo className="w-16 h-16 md:w-20 md:h-20 rounded-2xl shadow-lg shadow-blue-500/20 relative z-10" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-800 dark:text-dark-text-primary tracking-tight">Pilot AI Insights</h2>
                {insightsLoading && (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
              <span className={`px-3 py-1 text-xs font-extrabold rounded-full tracking-wider uppercase ${
                isOnboarding
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                  : insightsLoading 
                    ? 'bg-slate-100 dark:bg-dark-divider text-slate-500' 
                    : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400'
              }`}>
                {isOnboarding ? 'Warm Welcome' : (insights ? insights.badge : 'Analyzing Workspace...')}
              </span>
            </div>

            {/* Insight Text Area */}
            {insightsLoading && !insights ? (
              <div className="space-y-2 py-2">
                <div className="h-4 bg-slate-100 dark:bg-dark-divider rounded w-11/12 animate-pulse"></div>
                <div className="h-4 bg-slate-100 dark:bg-dark-divider rounded w-5/6 animate-pulse"></div>
                <div className="h-4 bg-slate-100 dark:bg-dark-divider rounded w-2/3 animate-pulse"></div>
              </div>
            ) : (
              <motion.p 
                key={insights?.recommendation || (isOnboarding ? 'onboarding-' + onboardingMessage : 'fallback')}
                initial={{ opacity: 0, y: 5 }} 
                animate={{ opacity: 1, y: 0 }}
                className="text-slate-600 dark:text-dark-text-secondary text-sm leading-relaxed mb-4 font-medium"
              >
                {isOnboarding 
                  ? onboardingMessage 
                  : (insights 
                      ? insights.recommendation 
                      : "Hello! Welcome back. I am analyzing your active workspace to build your tailored hourly schedule and cognitive performance insights. Add your current objectives below to begin.")}
              </motion.p>
            )}

            {/* Action Buttons Row */}
            {isOnboarding ? (
              <div className="flex flex-wrap gap-2.5">
                <button 
                  onClick={() => setShowTaskModal(true)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
                >
                  Create First Task
                </button>
                <button 
                  onClick={() => setShowHabitModal(true)}
                  className="px-4 py-2.5 border border-slate-200 dark:border-dark-divider text-slate-600 dark:text-dark-text-secondary hover:text-slate-800 dark:hover:text-dark-text-primary text-xs font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-dark-elevated transition-colors active:scale-95"
                >
                  Create First Habit
                </button>
                <button 
                  onClick={() => setShowGoalModal(true)}
                  className="px-4 py-2.5 border border-slate-200 dark:border-dark-divider text-slate-600 dark:text-dark-text-secondary hover:text-slate-800 dark:hover:text-dark-text-primary text-xs font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-dark-elevated transition-colors active:scale-95"
                >
                  Create First Goal
                </button>
                <button 
                  onClick={handleBuildMyDay}
                  disabled={insightsLoading}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                >
                  {insightsLoading ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-3.5 h-3.5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.46 5.05L5.75 4.35a1 1 0 10-1.41 1.41l.71.7zM10 18a1 1 0 110-2h.01a1 1 0 110 2H10zM14.24 16.36a1 1 0 101.41-1.41l-.7-.7a1 1 0 10-1.41 1.41l.7.7zM3.66 14.24a1 1 0 001.41 1.41l.7-.7a1 1 0 10-1.41-1.41l-.7.7zM3 10a1 1 0 011-1h1a1 1 0 110 2H4a1 1 0 01-1-1z"></path>
                    </svg>
                  )}
                  Let Pilot Build My Day
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                <button 
                  onClick={handleApplyAiSchedule}
                  disabled={insightsLoading}
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 ${
                    scheduleApplied 
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/10' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10'
                  }`}
                >
                  {scheduleApplied ? '✓ AI Schedule Active' : 'Apply AI Schedule'}
                </button>
                <button 
                  onClick={() => setShowExplanation(true)}
                  disabled={!insights}
                  className="px-4 py-2.5 border border-slate-200 dark:border-dark-divider text-slate-600 dark:text-dark-text-secondary hover:text-slate-800 dark:hover:text-dark-text-primary text-xs font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-dark-elevated transition-colors active:scale-95 disabled:opacity-40"
                >
                  Explain Recommendation
                </button>
                <button 
                  onClick={scrollToPlan}
                  className="px-4 py-2.5 border border-slate-200 dark:border-dark-divider text-slate-600 dark:text-dark-text-secondary hover:text-slate-800 dark:hover:text-dark-text-primary text-xs font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-dark-elevated transition-colors active:scale-95"
                >
                  View Today's Plan
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Visual Agenda (Renders beautifully when Apply AI Schedule is active) */}
        <AnimatePresence>
          {scheduleApplied && insights?.todaySchedule && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-slate-100 dark:border-dark-divider pt-5 overflow-hidden"
            >
              <h3 className="text-xs font-extrabold text-slate-400 dark:text-dark-text-secondary uppercase tracking-wider mb-3">Today&apos;s Dynamic AI Timeline</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {insights.todaySchedule.map((item: any, i: number) => (
                  <div key={i} className="p-3.5 bg-slate-50 dark:bg-dark-elevated rounded-2xl border border-slate-100 dark:border-dark-border/40 hover:shadow-xs transition-all duration-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono uppercase">{item.time}</span>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                          item.type === 'Focus Block' ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400' :
                          item.type === 'Habit Stack' ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400' :
                          item.type === 'Goal Progress' ? 'bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400' :
                          'bg-slate-100 dark:bg-dark-border text-slate-600 dark:text-dark-text-secondary'
                        }`}>{item.type}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 dark:text-dark-text-primary truncate" title={item.activity}>
                        {item.activity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Focus Session Pomodoro Cockpit Card */}
      <section className="md:col-span-2 xl:col-span-4 bg-white dark:bg-dark-secondary border border-slate-100 dark:border-dark-border rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all duration-300">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-slate-800 dark:text-dark-text-primary flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 ${focusTimerActive ? 'inline-flex' : 'hidden'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${focusTimerActive ? 'bg-red-500' : 'bg-slate-400'}`}></span>
            </span>
            Pomodoro Focus Sprint
          </h2>
          <span className="text-xs font-mono font-bold text-slate-400 dark:text-dark-text-muted">25m Block</span>
        </div>

        <div className="flex flex-col items-center justify-center py-2 flex-1">
          {/* Ticking visuals */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100 dark:text-dark-divider" />
              <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="301.6" strokeDashoffset={301.6 - (301.6 * (focusTimeLeft / 1500))} className="text-blue-600 transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-800 dark:text-dark-text-primary tracking-tighter">{formatTime(focusTimeLeft)}</span>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">{focusTimerActive ? 'Active' : 'Paused'}</span>
            </div>
          </div>

          {/* Task selector */}
          <div className="w-full mt-4">
            <select
              value={selectedTaskForFocus}
              onChange={(e) => setSelectedTaskForFocus(e.target.value)}
              disabled={focusTimerActive}
              className="w-full text-xs font-bold bg-slate-50 dark:bg-dark-elevated border border-slate-200 dark:border-dark-border rounded-xl px-3 py-2 text-slate-700 dark:text-dark-text-secondary focus:outline-none focus:border-blue-500 disabled:opacity-60"
            >
              <option value="">-- Focus on a Task (None) --</option>
              {tasks.filter(t => t.status !== 'completed').map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Timer Control row */}
        <div className="flex gap-2.5 mt-2 shrink-0">
          <button
            onClick={toggleFocusTimer}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95 ${
              focusTimerActive 
                ? 'bg-amber-500 text-white hover:bg-amber-600' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {focusTimerActive ? 'Pause' : 'Start Focus'}
          </button>
          <button
            onClick={resetFocusTimer}
            className="px-3 py-2 bg-slate-100 dark:bg-dark-elevated hover:bg-slate-200 text-slate-600 dark:text-dark-text-secondary text-xs font-bold rounded-xl transition-all active:scale-95"
          >
            Reset
          </button>
          <button
            onClick={skipFocusTimer}
            className="px-3 py-2 bg-slate-900 dark:bg-blue-900/30 text-white dark:text-blue-400 text-xs font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-95"
            title="Fast forward session to complete instantly (Great for testing!)"
          >
            ⏩ Skip
          </button>
        </div>
      </section>

      {/* Task Management */}
      <section id="todays-pilot-section" className="md:col-span-2 xl:col-span-4 xl:row-span-4 bg-white dark:bg-dark-secondary border border-slate-100 dark:border-dark-border rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col min-h-[420px] transition-colors duration-300">
        <div className="flex justify-between items-center mb-5 shrink-0">
          <h2 className="text-lg font-extrabold text-slate-800 dark:text-dark-text-primary tracking-tight">Today&apos;s Pilot Tasks</h2>
          <button 
            onClick={() => setShowTaskModal(true)} 
            className="px-3 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl transition-all active:scale-95"
          >
            + Add Task
          </button>
        </div>
        
        <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-slate-50 dark:bg-dark-elevated rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                </svg>
              </div>
              <p className="text-sm text-slate-500 dark:text-dark-text-secondary font-semibold">No tasks scheduled today.</p>
              <p className="text-xs text-slate-400 dark:text-dark-text-muted mt-1">Get started by creating a task.</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3 group relative p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-elevated transition-colors">
                <button 
                  onClick={() => toggleTaskStatus(task)}
                  className={`w-6 h-6 shrink-0 border-2 rounded-lg flex items-center justify-center transition-colors mt-0.5 cursor-pointer
                    ${task.status === 'completed' 
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' 
                      : 'border-slate-200 dark:border-dark-border hover:border-blue-600 text-transparent'}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                </button>
                <div className="flex-1 min-w-0 pr-8">
                  <p className={`text-sm font-bold truncate ${task.status === 'completed' ? 'text-slate-400 dark:text-dark-text-muted line-through' : 'text-slate-800 dark:text-dark-text-primary'}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-bold uppercase ${
                      task.priority === 'urgent' ? 'text-red-500' :
                      task.priority === 'high' ? 'text-orange-500' :
                      task.priority === 'medium' ? 'text-blue-500' :
                      'text-slate-400'
                    }`}>
                      {task.priority}
                    </span>
                    {task.category && (
                      <span className="text-[10px] font-bold text-slate-400 dark:text-dark-text-muted">
                        • {task.category}
                      </span>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={() => deleteTask(task.id)}
                  className="absolute right-2 top-2.5 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
        <div className="pt-4 border-t border-slate-50 dark:border-dark-divider mt-4 shrink-0">
          <p className="text-[11px] text-center text-slate-400 dark:text-dark-text-muted italic">Pilot suggests: Concentrate on completing high-urgency items first.</p>
        </div>
      </section>

      {/* Productivity Score Analytics */}
      <section className="md:col-span-1 xl:col-span-4 bg-white dark:bg-dark-secondary border border-slate-100 dark:border-dark-border rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-colors duration-300 min-h-[220px]">
        <h2 className="text-lg font-extrabold text-slate-800 dark:text-dark-text-primary tracking-tight mb-3">Real-time Productivity</h2>
        <div className="flex items-end gap-1.5 h-20 mb-4">
          <div className="flex-1 bg-blue-100 dark:bg-blue-950/40 rounded-t-lg h-[40%] hover:bg-blue-200 transition-all"></div>
          <div className="flex-1 bg-blue-100 dark:bg-blue-950/40 rounded-t-lg h-[65%] hover:bg-blue-200 transition-all"></div>
          <div className="flex-1 bg-blue-100 dark:bg-blue-950/40 rounded-t-lg h-[45%] hover:bg-blue-200 transition-all"></div>
          <div className="flex-1 bg-blue-200 dark:bg-blue-900/40 rounded-t-lg h-[80%] hover:bg-blue-300 transition-all"></div>
          <div className="flex-1 bg-blue-300 dark:bg-blue-800/40 rounded-t-lg h-[70%] hover:bg-blue-400 transition-all"></div>
          <div className="flex-1 bg-blue-600 dark:bg-blue-600 rounded-t-lg h-[95%] hover:bg-blue-700 transition-all"></div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-3xl font-black text-blue-600 dark:text-blue-400">
            {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 100}
            <span className="text-sm font-normal text-slate-400 dark:text-dark-text-muted ml-1">/100 score</span>
          </span>
          <span className="text-xs font-bold text-green-500 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"></path>
            </svg>
            {insights ? insights.productivityScoreTrend : 'Updating trend'}
          </span>
        </div>
      </section>

      {/* Habit Tracking Section */}
      <section className="md:col-span-1 xl:col-span-4 bg-white dark:bg-dark-secondary text-slate-800 dark:text-white border border-slate-100 dark:border-dark-border rounded-3xl p-6 shadow-sm min-h-[220px] flex flex-col justify-between transition-colors duration-300">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-extrabold tracking-tight">Daily Habit Stacks</h2>
          <button 
            onClick={() => setShowHabitModal(true)}
            className="text-slate-600 dark:text-white/80 hover:text-slate-900 dark:hover:text-white text-xs font-extrabold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition-all active:scale-95"
          >
            + Add Habit
          </button>
        </div>
        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
          {habits.filter(h => h.title).length === 0 ? (
            <div className="text-center py-8 text-slate-400 dark:text-white/50 text-xs font-bold">
              No habits added yet. Click "+ Add Habit" to get started.
            </div>
          ) : (
            habits.filter(h => h.title).map((habit, idx) => (
              <div 
                key={habit.id || idx}
                onClick={() => incrementHabitProgress(habit)}
                className="group cursor-pointer hover:bg-slate-50 dark:hover:bg-dark-elevated p-2 rounded-xl transition-all"
                title="Click to track"
              >
                <div className="flex justify-between text-xs mb-1 font-bold">
                  <span className="truncate pr-2">{habit.title}</span>
                </div>
              </div>
            ))
          )}
        </div>
        <p className="text-[10px] text-slate-400 dark:text-white/50 italic text-center mt-2">💡 Click habit row to manage routine.</p>
      </section>

      {/* Goals & Progress Card */}
      <section className="md:col-span-1 xl:col-span-4 bg-white dark:bg-dark-secondary border border-slate-100 dark:border-dark-border rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[220px] transition-colors duration-300">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-extrabold text-slate-800 dark:text-dark-text-primary tracking-tight">Goal Trackers</h2>
          <button 
            onClick={() => setShowGoalModal(true)}
            className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-xs font-bold rounded-xl transition-all active:scale-95"
          >
            + Add Goal
          </button>
        </div>
        <div className="flex-1 overflow-y-auto max-h-[140px] pr-1">
          {goals.map((goal, idx) => (
            <div key={goal.id || idx} className="flex items-center justify-between gap-3 py-1">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-dark-text-primary truncate" title={goal.title}>
                  {goal.title}
                </h3>
                <div className="text-[11px] text-slate-400 dark:text-dark-text-muted font-bold flex gap-2 mt-0.5">
                  <span>{goal.daysRemaining || 0} days left</span>
                  <span>•</span>
                  <span>{goal.milestonesHit || 0}/{goal.totalMilestones || 0} milestones</span>
                </div>
              </div>
              <div className="relative w-12 h-12 shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100 dark:text-dark-divider" />
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="125.6" strokeDashoffset={125.6 - (125.6 * ((goal.progress || 0) / 100))} className="text-orange-500 transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold text-slate-700 dark:text-dark-text-primary">{goal.progress || 0}%</div>
              </div>
            </div>
          ))}
          {goals.length === 0 && (
            <div className="text-center text-slate-400 dark:text-dark-text-muted text-xs py-8 font-bold">No goals tracked.</div>
          )}
        </div>
      </section>

      {/* Quick Pilot Chat Banner */}
      <Link href="/pilot-chat" className="md:col-span-2 xl:col-span-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between gap-6 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer group min-h-[100px] mt-2">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-extrabold text-slate-800 dark:text-white italic tracking-tight mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            &ldquo;Pilot, what should I do next?&rdquo;
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl truncate">
            Launch Pilot Chat to request custom scheduling, analyze long-term habits, generate daily scripts, or run deep productivity queries.
          </p>
        </div>
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-sm shadow-blue-500/20 shrink-0 group-hover:bg-blue-500 transition-all group-hover:scale-105 active:scale-95">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
          </svg>
        </div>
      </Link>

    </div>
  );
}
