import { motion } from 'framer-motion';
import type { Goal } from '../../types/goal';
import { calculateGoalStats } from '../../utils/streak';
import { CircularProgress } from '../common/CircularProgress';
import { ArrowRight, CheckCircle2, Calendar, Trash2, Share2 } from 'lucide-react';

interface GoalCardProps {
  goal: Goal;
  onSelect: (goalId: string) => void;
  onDeleteRequest: (goal: Goal) => void;
  onShareRequest?: (goal: Goal) => void;
}

export function GoalCard({
  goal,
  onSelect,
  onDeleteRequest,
  onShareRequest,
}: GoalCardProps) {
  const stats = calculateGoalStats(goal);
  const nextPendingDay = goal.days?.find((d) => !d.completed);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={() => onSelect(goal.id)}
      className="group relative flex flex-col justify-between p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft dark:shadow-soft-dark hover:shadow-card hover:border-brand-500/40 dark:hover:border-brand-500/40 cursor-pointer transition-all duration-200"
    >
      {/* Top section: Title, tag, delete button */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            {goal.category && (
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 mb-1.5">
                {goal.category}
              </span>
            )}
            <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {goal.name}
            </h3>
          </div>

          <div className="flex items-center gap-1">
            {onShareRequest && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShareRequest(goal);
                }}
                title="Share Roadmap"
                className="opacity-80 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 p-2 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-all duration-150"
                aria-label={`Share roadmap ${goal.name}`}
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteRequest(goal);
              }}
              title="Delete Goal"
              className="opacity-80 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all duration-150"
              aria-label={`Delete goal ${goal.name}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress & Circular Ring Area */}
        <div className="flex items-center justify-between gap-4 py-2">
          <div className="space-y-1.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {stats.completedDays}
              </span>
              <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">
                / {stats.totalDays} days
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {stats.isCompleted ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Roadmap Finished
                </span>
              ) : (
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {stats.totalDays - stats.completedDays} days remaining
                </span>
              )}

              {stats.streak > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-[11px] font-black border border-amber-200/60 dark:border-amber-800/40">
                  🔥 {stats.streak}
                </span>
              )}
            </div>
          </div>

          <CircularProgress
            percentage={stats.percentage}
            size={76}
            strokeWidth={7}
          />
        </div>
      </div>

      {/* Bottom section: Next upcoming day or completed status */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        {nextPendingDay ? (
          <div className="min-w-0 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-brand-500 shrink-0" />
            <span className="truncate">
              <strong className="text-slate-700 dark:text-slate-300">
                Day {nextPendingDay.dayNumber}:
              </strong>{' '}
              {nextPendingDay.topic}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>All milestones completed!</span>
          </div>
        )}

        <div className="flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 shrink-0 group-hover:translate-x-1 transition-transform">
          <span>Roadmap</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </motion.div>
  );
}
