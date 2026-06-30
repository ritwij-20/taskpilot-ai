'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Logo } from '@/components/Logo';

export default function LoginPage() {
  const { signInAsGuest } = useAuth();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    
    if (isForgotPassword) {
      try {
        await sendPasswordResetEmail(auth, email);
        setSuccessMsg('Password reset email sent! Check your inbox.');
        setIsForgotPassword(false);
      } catch (err: any) {
        setError(err.message || 'Failed to send reset email');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAuth = async () => {
    setError('');
    setLoading(true);
    try {
      await signInAsGuest();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Guest sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-dark-bg transition-colors duration-300 overflow-y-auto">
      <div className="m-auto w-full sm:max-w-md">
        <div>
          <div className="flex justify-center mb-6">
            <Logo className="w-16 h-16 rounded-2xl shadow-xl" />
          </div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-dark-text-primary">
            {isForgotPassword ? 'Reset password' : isLogin ? 'Sign in to TaskPilot AI' : 'Create an account'}
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-dark-text-secondary">
            Your AI-powered productivity companion
          </p>
        </div>

        <div className="mt-8">
          <div className="bg-white dark:bg-dark-secondary py-8 px-4 shadow rounded-2xl sm:px-10 border border-slate-100 dark:border-dark-border transition-colors duration-300">
            <form className="space-y-6" onSubmit={handleEmailAuth}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-100 dark:border-red-900/40">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-lg text-sm border border-green-100 dark:border-green-900/40">
                {successMsg}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary">Email address</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full appearance-none rounded-xl border border-slate-200 dark:border-dark-divider bg-white dark:bg-dark-elevated px-3 py-2 text-slate-900 dark:text-dark-text-primary placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm transition-colors"
                />
              </div>
            </div>

            {!isForgotPassword && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-dark-text-secondary">Password</label>
                <div className="mt-1">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full appearance-none rounded-xl border border-slate-200 dark:border-dark-divider bg-white dark:bg-dark-elevated px-3 py-2 text-slate-900 dark:text-dark-text-primary placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm transition-colors"
                  />
                </div>
              </div>
            )}

            {!isForgotPassword && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300 dark:border-dark-divider bg-white dark:bg-dark-elevated text-blue-600 focus:ring-blue-500" />
                  <label className="ml-2 block text-sm text-slate-700 dark:text-dark-text-secondary">Remember me</label>
                </div>
                <div className="text-sm">
                  <button type="button" onClick={() => setIsForgotPassword(true)} className="font-medium text-blue-600 hover:text-blue-500">Forgot password?</button>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-xl bg-blue-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 transition-colors"
              >
                {loading ? 'Processing...' : (isForgotPassword ? 'Send reset link' : isLogin ? 'Sign in' : 'Sign up')}
              </button>
            </div>
            
            {isForgotPassword && (
              <div className="text-center">
                <button type="button" onClick={() => setIsForgotPassword(false)} className="text-sm font-medium text-slate-600 dark:text-dark-text-secondary hover:text-slate-900 dark:hover:text-dark-text-primary">
                  Back to login
                </button>
              </div>
            )}
          </form>

          {!isForgotPassword && (
            <>
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-dark-divider" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white dark:bg-dark-secondary px-2 text-slate-500 dark:text-dark-text-muted transition-colors duration-300">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    onClick={handleGoogleAuth}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-elevated py-2 px-4 text-sm font-medium text-slate-700 dark:text-dark-text-primary hover:bg-slate-50 dark:hover:bg-dark-divider transition-colors"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Google
                  </button>
                  <button
                    onClick={handleGuestAuth}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-elevated py-2 px-4 text-sm font-medium text-slate-700 dark:text-dark-text-primary hover:bg-slate-50 dark:hover:bg-dark-divider transition-colors"
                  >
                    Guest Mode
                  </button>
                </div>
              </div>
              
              <div className="mt-6 text-center text-sm">
                <span className="text-slate-500 dark:text-dark-text-secondary">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                </span>
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </div>
            </>
          )}
        </div>
        <p className="text-center text-xs text-slate-400 dark:text-dark-text-muted mt-6">
          *Note: To use Email/Password or Guest Mode, ensure they are enabled in your Firebase Console.
        </p>
      </div>
    </div>
  </div>
  );
}
