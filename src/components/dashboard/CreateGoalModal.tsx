import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Calendar, Sparkles, X, ArrowRight } from 'lucide-react';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    name: string,
    totalDays: number,
    startDate?: string,
    endDate?: string
  ) => void;
}

const PRESET_DAYS = [7, 14, 21, 30, 60, 100];
const SUGGESTIONS = [
  '30 Days of LeetCode',
  'Master React & TypeScript',
  'Learn System Design',
  'Build 5 Fullstack Projects',
  'Read 20 Pages Daily',
  'Daily 5km Jogging',
];

const getTodayString = () => new Date().toISOString().split('T')[0];
const getFutureDateString = (days: number, fromDate: string = getTodayString()) => {
  const d = new Date(fromDate);
  d.setDate(d.getDate() + (days - 1));
  return d.toISOString().split('T')[0];
};

export function CreateGoalModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateGoalModalProps) {
  const [goalName, setGoalName] = useState('');
  const [totalDays, setTotalDays] = useState<number | string>(14);
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(getFutureDateString(14));
  const [error, setError] = useState<string | null>(null);

  const handleStartDateChange = (newStart: string) => {
    setStartDate(newStart);
    if (newStart && endDate) {
      const startMs = new Date(newStart).getTime();
      const endMs = new Date(endDate).getTime();
      if (endMs >= startMs) {
        const diff = Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1;
        setTotalDays(diff);
      } else {
        // Auto adjust end date forward
        const days = typeof totalDays === 'number' ? totalDays : parseInt(totalDays, 10) || 14;
        setEndDate(getFutureDateString(days, newStart));
      }
    }
  };

  const handleEndDateChange = (newEnd: string) => {
    setEndDate(newEnd);
    if (startDate && newEnd) {
      const startMs = new Date(startDate).getTime();
      const endMs = new Date(newEnd).getTime();
      if (endMs < startMs) {
        setError('End date cannot be earlier than start date');
        return;
      }
      setError(null);
      const diff = Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1;
      setTotalDays(Math.max(1, diff));
    }
  };

  const handleDaysPreset = (days: number) => {
    setTotalDays(days);
    if (startDate) {
      setEndDate(getFutureDateString(days, startDate));
    }
    setError(null);
  };

  const handleDaysInputChange = (val: string) => {
    setTotalDays(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0 && startDate) {
      setEndDate(getFutureDateString(parsed, startDate));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = goalName.trim();
    const daysNum = typeof totalDays === 'number' ? totalDays : parseInt(totalDays, 10);

    if (!trimmed) {
      setError('Please provide a goal name');
      return;
    }

    if (isNaN(daysNum) || daysNum < 1) {
      setError('Days must be at least 1');
      return;
    }

    if (daysNum > 365) {
      setError('Maximum 365 days allowed per goal roadmap');
      return;
    }

    if (startDate && endDate && new Date(endDate).getTime() < new Date(startDate).getTime()) {
      setError('End date must be after or on start date');
      return;
    }

    setError(null);
    onSubmit(trimmed, daysNum, startDate, endDate);
    setGoalName('');
    setTotalDays(14);
    setStartDate(getTodayString());
    setEndDate(getFutureDateString(14));
    onClose();
  };

  const selectSuggestion = (suggestion: string) => {
    setGoalName(suggestion);
    setError(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 dark:bg-black/70 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-lg bg-white dark:bg-[#0a0314] rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 dark:border-purple-900/40 z-10 max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-purple-300 rounded-full hover:bg-slate-100 dark:hover:bg-purple-950/50 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Create New Goal
                </h2>
                <p className="text-xs text-slate-500 dark:text-purple-300/70">
                  Set target schedule & auto-generate day-by-day roadmap
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Goal Name Field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-purple-200 mb-1.5">
                  Goal Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    autoFocus
                    value={goalName}
                    onChange={(e) => {
                      setGoalName(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="e.g. Master Python, 30 Days of LeetCode"
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#140726] border border-slate-200 dark:border-purple-800/40 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-purple-400/40 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                  />
                </div>

                {/* Inspiration chips */}
                <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] text-slate-400 dark:text-purple-400/60 flex items-center gap-1 mr-1">
                    <Sparkles className="w-3 h-3 text-amber-500" /> Ideas:
                  </span>
                  {SUGGESTIONS.slice(0, 3).map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => selectSuggestion(s)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-purple-950/40 text-slate-600 dark:text-purple-300 hover:bg-brand-50 hover:text-purple-600 dark:hover:bg-purple-900/40 transition-colors border border-transparent dark:border-purple-900/30"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start & End Date Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-purple-200 mb-1.5">
                    Start Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#140726] border border-slate-200 dark:border-purple-800/40 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-purple-200 mb-1.5">
                    End Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      min={startDate}
                      value={endDate}
                      onChange={(e) => handleEndDateChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#140726] border border-slate-200 dark:border-purple-800/40 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Days to Achieve Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-purple-200">
                    Days to Achieve
                  </label>
                  <span className="text-xs text-purple-600 dark:text-purple-400 font-bold">
                    Day 1 through Day {totalDays || 0}
                  </span>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-purple-400/60">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    required
                    value={totalDays}
                    onChange={(e) => handleDaysInputChange(e.target.value)}
                    placeholder="e.g. 14"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#140726] border border-slate-200 dark:border-purple-800/40 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                  />
                </div>

                {/* Preset day buttons */}
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-400 dark:text-purple-400/60 mr-1">
                    Presets:
                  </span>
                  {PRESET_DAYS.map((days) => (
                    <button
                      type="button"
                      key={days}
                      onClick={() => handleDaysPreset(days)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        Number(totalDays) === days
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-purple-950/40 text-slate-600 dark:text-purple-300 hover:bg-slate-200 dark:hover:bg-purple-900/40 border border-transparent dark:border-purple-900/30'
                      }`}
                    >
                      {days}d
                    </button>
                  ))}
                </div>
              </div>

              {/* Error notification */}
              {error && (
                <div className="text-xs text-rose-500 font-medium p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-purple-300 hover:bg-slate-100 dark:hover:bg-purple-950/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold text-sm shadow-md shadow-purple-500/25 hover:shadow-lg active:scale-95 transition-all"
                >
                  <span>Build Roadmap</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
