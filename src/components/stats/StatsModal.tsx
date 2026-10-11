import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Clock,
  Timer,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Sparkles,
  BarChart3,
  HelpCircle,
} from 'lucide-react';
import type { Goal } from '../../types/goal';
import type { StatsFilterView } from '../../types/stats';
import {
  getStudyLog,
  extractCompletionsFromGoals,
  calculatePeriodStats,
} from '../../utils/studyStats';
import {
  isCurrentOrFuturePeriod,
  navigatePeriod,
} from '../../utils/dateUtils';
import { calculateGlobalStats } from '../../utils/streak';
import { StatsBarChart } from './StatsBarChart';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: Goal[];
}

export function StatsModal({ isOpen, onClose, goals }: StatsModalProps) {
  const [activeView, setActiveView] = useState<StatsFilterView>('week');
  const [anchorDate, setAnchorDate] = useState<Date>(() => new Date());
  const [version, setVersion] = useState(0);

  // Re-read storage and update stats on mount or when arrow_stats_updated event fires
  useEffect(() => {
    const handleUpdate = () => {
      setVersion((v) => v + 1);
    };
    window.addEventListener('arrow_stats_updated', handleUpdate);
    return () => window.removeEventListener('arrow_stats_updated', handleUpdate);
  }, []);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Overall roadmap progress across all goals
  const globalStats = useMemo(() => {
    return calculateGlobalStats(goals);
  }, [goals]);

  // Extract study log and completions
  const studyLog = useMemo(() => {
    // version dependency ensures re-read when stats update
    void version;
    return getStudyLog();
  }, [version]);

  const completions = useMemo(() => {
    return extractCompletionsFromGoals(goals);
  }, [goals]);

  // Calculate stats for selected period
  const periodStats = useMemo(() => {
    return calculatePeriodStats(activeView, anchorDate, studyLog, completions);
  }, [activeView, anchorDate, studyLog, completions]);

  const isNextDisabled = useMemo(() => {
    return isCurrentOrFuturePeriod(activeView, anchorDate);
  }, [activeView, anchorDate]);

  const handlePrev = () => {
    setAnchorDate((prev) => navigatePeriod(activeView, prev, 'prev'));
  };

  const handleNext = () => {
    if (isNextDisabled) return;
    setAnchorDate((prev) => navigatePeriod(activeView, prev, 'next'));
  };

  const handleToday = () => {
    setAnchorDate(new Date());
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-md overflow-y-auto"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="Overall Statistics"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl max-h-[92vh] rounded-3xl spatial-glass p-5 sm:p-7 overflow-y-auto shadow-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col my-auto"
        >
          {/* Subtle top edge specular highlight */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 dark:via-sky-400/50 to-transparent" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/60 dark:border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-blue-500/10 dark:bg-blue-400/15 border border-blue-500/20 text-blue-600 dark:text-blue-400 shadow-sm">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Overall Statistics
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Deep dive into your study time, focus sessions, and completed roadmap milestones.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              title="Close (Esc)"
              className="p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Tabs: Week, Month, Year, All time */}
          <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
            <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-slate-100/80 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 w-full sm:w-auto">
              {(
                [
                  { key: 'week', label: 'Week' },
                  { key: 'month', label: 'Month' },
                  { key: 'year', label: 'Year' },
                  { key: 'all', label: 'All time' },
                ] as const
              ).map((tab) => {
                const isActive = activeView === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveView(tab.key);
                      setAnchorDate(new Date());
                    }}
                    className={`py-1.5 px-3 text-xs font-bold rounded-xl transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Period Navigation (Prev / Next & Label & Today) */}
            {activeView !== 'all' && (
              <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrev}
                    title="Previous Period"
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Previous period"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 px-2 min-w-[120px] text-center">
                    {periodStats.periodLabel}
                  </span>
                  <button
                    onClick={handleNext}
                    disabled={isNextDisabled}
                    title={isNextDisabled ? 'Cannot navigate to future period' : 'Next Period'}
                    className={`p-1.5 rounded-xl border transition-colors ${
                      isNextDisabled
                        ? 'border-slate-200/50 dark:border-slate-800/50 text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-50'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    aria-label="Next period"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {!isNextDisabled && (
                  <button
                    onClick={handleToday}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-all"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Today</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 4 Summary Tiles for Selected Period */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-5">
            {/* Tile 1: Hours Studied */}
            <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                <span className="text-[11px] font-semibold">Hours Studied</span>
                <Clock className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                {periodStats.totalHoursFormatted}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                {periodStats.totalMinutes} total minutes
              </div>
            </div>

            {/* Tile 2: Pomodoros Completed */}
            <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                <span className="text-[11px] font-semibold">Pomodoros</span>
                <Timer className="w-3.5 h-3.5 text-sky-500" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                {periodStats.pomodorosCount}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                Focus sessions
              </div>
            </div>

            {/* Tile 3: Days Completed */}
            <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                <span className="text-[11px] font-semibold">Milestones Done</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                {periodStats.daysCompletedCount}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                Roadmap milestones
              </div>
            </div>

            {/* Tile 4: Average Study per Active Day */}
            <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                <span className="text-[11px] font-semibold">Avg / Active Day</span>
                <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                {periodStats.averageStudyPerActiveDayFormatted}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                {periodStats.activeDaysCount} active {periodStats.activeDaysCount === 1 ? 'day' : 'days'}
              </div>
            </div>
          </div>

          {/* Bar Chart Section */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 mb-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>Study Activity ({periodStats.periodLabel})</span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Tap or hover bars for details
              </span>
            </div>

            <StatsBarChart buckets={periodStats.buckets} />
          </div>

          {/* Overall Roadmap Progress Tile */}
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                  Overall Roadmap Progress
                </span>
                <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-blue-600 text-white">
                  {globalStats.overallPercentage}%
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                {globalStats.totalCompletedDays} of {globalStats.totalDays} total roadmap days completed across {globalStats.totalGoals} goals ({globalStats.completedGoalsCount} fully completed).
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full sm:w-48 bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden shrink-0">
              <div
                className="bg-gradient-to-r from-blue-600 to-sky-400 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, globalStats.overallPercentage)}%` }}
              />
            </div>
          </div>

          {/* Days Completed List for the Selected Period */}
          <div className="flex-1">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Milestones Completed in this Period</span>
              <span className="text-[11px] text-slate-400 font-normal">
                {periodStats.datedCompletions.length} dated
              </span>
            </h3>

            {periodStats.datedCompletions.length === 0 && periodStats.undatedCompletions.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800">
                <Calendar className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  No roadmap milestones completed in this period.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {/* Dated completions */}
                {periodStats.datedCompletions.map((item) => {
                  let formattedDate = item.date || '';
                  if (item.completedAt) {
                    try {
                      formattedDate = new Date(item.completedAt).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      });
                    } catch {
                      formattedDate = item.date || '';
                    }
                  }

                  return (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          Day {item.dayNumber}: {item.topic}
                        </div>
                        <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium truncate">
                          {item.goalTitle}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{formattedDate}</span>
                      </div>
                    </div>
                  );
                })}

                {/* Undated completions (shown in All time view) */}
                {periodStats.undatedCompletions.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                      <span>Undated Milestones ({periodStats.undatedCompletions.length})</span>
                    </div>

                    <div className="space-y-1.5">
                      {periodStats.undatedCompletions.map((item) => (
                        <div
                          key={item.id}
                          className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                              Day {item.dayNumber}: {item.topic}
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium truncate">
                              {item.goalTitle}
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40 shrink-0">
                            Undated
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
