'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DataService } from '@/lib/dataService';

export default function PilotChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial greeting
    setMessages([
      {
        role: 'assistant',
        content: "Hi! I'm your AI Pilot. How can I help you optimize your schedule or tasks today?"
      }
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Gather context
      const [tasks, habits, goals] = await Promise.all([
        DataService.getItems('tasks', user.uid, user.isAnonymous),
        DataService.getItems('habits', user.uid, user.isAnonymous),
        DataService.getItems('goals', user.uid, user.isAnonymous)
      ]);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: userMessage,
          context: {
            tasks,
            habits,
            goals
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AI response');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (error) {
      console.error('Error fetching chat', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Let's try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 min-h-full flex flex-col max-w-4xl mx-auto w-full">
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-dark-text-primary">Pilot Chat</h1>
        <p className="text-slate-500 dark:text-dark-text-secondary text-sm mt-1">Your AI productivity coach.</p>
      </div>

      <div className="flex-1 bg-white dark:bg-dark-secondary border border-slate-100 dark:border-dark-border rounded-3xl shadow-sm flex flex-col transition-colors duration-300">
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-slate-50 dark:bg-dark-elevated border border-slate-100 dark:border-dark-divider text-slate-700 dark:text-dark-text-primary rounded-bl-none'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-50 dark:bg-dark-elevated border border-slate-100 dark:border-dark-divider text-slate-700 dark:text-dark-text-primary rounded-2xl rounded-bl-none p-4 flex gap-1">
                <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-dark-text-muted animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-dark-text-muted animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-dark-text-muted animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="sticky bottom-0 p-4 bg-white dark:bg-dark-secondary border-t border-slate-100 dark:border-dark-border shrink-0 rounded-b-3xl shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] dark:shadow-none transition-colors duration-300">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Pilot to prioritize your tasks or analyze your habits..."
              className="flex-1 bg-slate-50 dark:bg-dark-elevated border border-slate-200 dark:border-dark-divider rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder:text-slate-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 shrink-0"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
