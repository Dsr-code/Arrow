import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Check, Trash2, Clock, ChevronUp } from 'lucide-react';
import type { DayLog } from '../../types/goal';

interface DayLogEditorProps {
  log?: DayLog;
  isOpen: boolean;
  onSave: (text: string) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function DayLogEditor({
  log,
  isOpen,
  onSave,
  onDelete,
  onClose,
}: DayLogEditorProps) {
  const [text, setText] = useState(log?.text || '');
  const [isSavedIndicator, setIsSavedIndicator] = useState(false);
  const debounceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setText(log?.text || '');
  }, [log]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);

    // Debounced autosave
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = window.setTimeout(() => {
      onSave(val);
      setIsSavedIndicator(true);
      setTimeout(() => setIsSavedIndicator(false), 2000);
    }, 800);
  };

  const handleManualSave = () => {
    onSave(text);
    setIsSavedIndicator(true);
    setTimeout(() => setIsSavedIndicator(false), 2000);
    onClose();
  };

  const formattedDate = log?.updatedAt
    ? new Date(log.updatedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="mt-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 font-medium">
                <BookOpen className="w-3.5 h-3.5 text-brand-500" />
                <span>Daily Reflection & Study Notes</span>
              </div>
              <div className="flex items-center gap-3">
                {formattedDate && (
                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    Edited {formattedDate}
                  </span>
                )}
                {isSavedIndicator && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 animate-fadeIn">
                    <Check className="w-3 h-3" />
                    Autosaved
                  </span>
                )}
              </div>
            </div>

            <textarea
              value={text}
              onChange={handleChange}
              placeholder="What did you learn today? Notes, takeaways, formulas, or challenges faced..."
              rows={3}
              className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 resize-y transition-all"
            />

            <div className="flex items-center justify-between pt-1">
              {log ? (
                <button
                  type="button"
                  onClick={onDelete}
                  className="inline-flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 font-medium px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Log</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Minimize</span>
                </button>
                <button
                  type="button"
                  onClick={handleManualSave}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Done</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
