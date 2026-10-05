import { useState, type FormEvent, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, User, Sparkles, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface WelcomeScreenProps {
  onComplete: (name: string) => void;
}

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { resolvedTheme, toggleTheme } = useTheme();

  useEffect(() => {
    // Auto-focus input on mount
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter your name or nickname to continue');
      inputRef.current?.focus();
      return;
    }
    if (trimmed.length > 30) {
      setError('Name should be under 30 characters');
      return;
    }
    setError(null);
    onComplete(trimmed);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-[#030007] text-slate-900 dark:text-purple-100 transition-colors relative overflow-hidden select-none">
      {/* Decorative ambient glowing backgrounds */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] h-[340px] sm:h-[500px] bg-gradient-to-tr from-brand-500/15 via-purple-500/15 to-indigo-500/10 dark:from-purple-900/30 dark:via-purple-600/20 dark:to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2.5 rounded-2xl bg-white/80 dark:bg-[#0a0314]/80 backdrop-blur-md border border-slate-200/80 dark:border-purple-900/50 text-slate-600 dark:text-purple-300 hover:text-slate-900 dark:hover:text-white shadow-soft transition-all"
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <div className="p-7 sm:p-10 rounded-3xl sm:rounded-[32px] bg-white dark:bg-[#0a0314] border border-slate-200/80 dark:border-purple-900/50 shadow-2xl dark:shadow-purple-950/30 backdrop-blur-xl">
          {/* Brand Icon Header */}
          <div className="flex flex-col items-center text-center mb-7">
            <motion.div
              initial={{ scale: 0.8, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: 'spring', damping: 15 }}
              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 p-0.5 shadow-xl shadow-brand-500/30 flex items-center justify-center mb-5"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-9 h-9 sm:w-11 sm:h-11 text-white transform -rotate-45"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </motion.div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-purple-950/60 border border-brand-200/60 dark:border-purple-800/40 text-brand-700 dark:text-purple-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-brand-500 dark:text-purple-400" />
              <span>Welcome to Arrow Tracker</span>
            </div>

            {/* The exact question requested by the user */}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              What should I call you?
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-purple-300/70 mt-2 max-w-xs leading-relaxed">
              Tell us your name or nickname to personalize your daily roadmaps and track your streaks.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-purple-400/60">
                <User className="w-5 h-5" />
              </div>

              <input
                ref={inputRef}
                type="text"
                autoFocus
                maxLength={30}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter your name..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-[#140726] border border-slate-200 dark:border-purple-800/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-purple-400/40 text-base font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-inner"
              />
            </div>

            {/* Error feedback */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-medium text-rose-500 dark:text-rose-400 pl-1"
              >
                {error}
              </motion.p>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 hover:from-brand-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm sm:text-base shadow-lg shadow-brand-500/25 active:scale-[0.98] transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Discreet footnote */}
          <p className="text-[11px] text-center text-slate-400 dark:text-purple-400/50 mt-6">
            Stored locally on your device. Never shared.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
