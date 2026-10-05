import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { ToastItem, ToastType } from '../types/goal';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';

interface ToastContextValue {
  showToast: (title: string, message?: string, type?: ToastType, duration?: number) => void;
  success: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (title: string, message?: string, type: ToastType = 'info', duration: number = 3800) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = { id, title, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, message?: string) => showToast(title, message, 'success'),
    [showToast]
  );
  const info = useCallback(
    (title: string, message?: string) => showToast(title, message, 'info'),
    [showToast]
  );
  const warning = useCallback(
    (title: string, message?: string) => showToast(title, message, 'warning'),
    [showToast]
  );
  const error = useCallback(
    (title: string, message?: string) => showToast(title, message, 'error'),
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{ showToast, success, info, warning, error, removeToast }}
    >
      {children}
      <div
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
        aria-live="polite"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            const icons = {
              success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
              info: <Info className="w-5 h-5 text-indigo-500 shrink-0" />,
              warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
              error: <XCircle className="w-5 h-5 text-rose-500 shrink-0" />,
            };

            const borderColors = {
              success: 'border-emerald-500/20 dark:border-emerald-500/30',
              info: 'border-indigo-500/20 dark:border-indigo-500/30',
              warning: 'border-amber-500/20 dark:border-amber-500/30',
              error: 'border-rose-500/20 dark:border-rose-500/30',
            };

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-card dark:shadow-card-dark border ${borderColors[toast.type]}`}
              >
                <div className="pt-0.5">{icons[toast.type]}</div>
                <div className="flex-1 min-w-0 pr-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                    {toast.title}
                  </p>
                  {toast.message && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {toast.message}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Close notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
