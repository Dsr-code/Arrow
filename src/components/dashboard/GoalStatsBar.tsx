import { Target, CheckCircle2, Flame, TrendingUp } from 'lucide-react';
import type { GlobalStats } from '../../utils/streak';

interface GoalStatsBarProps {
  stats: GlobalStats;
}

export function GoalStatsBar({ stats }: GoalStatsBarProps) {
  const cards = [
    {
      label: 'Active Roadmaps',
      value: stats.activeGoalsCount,
      subValue: `${stats.totalGoals} total`,
      icon: <Target className="w-5 h-5 text-brand-600 dark:text-brand-400" />,
      bg: 'bg-brand-50/60 dark:bg-brand-950/40 border-brand-100 dark:border-brand-900/50',
    },
    {
      label: 'Completed Days',
      value: stats.totalCompletedDays,
      subValue: `${stats.totalDays} total days`,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      bg: 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/50',
    },
    {
      label: 'Overall Progress',
      value: `${stats.overallPercentage}%`,
      subValue: `${stats.completedGoalsCount} completed goal${stats.completedGoalsCount === 1 ? '' : 's'}`,
      icon: <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      bg: 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/50',
    },
    {
      label: 'Streak',
      value: `🔥 ${stats.highestStreak}`,
      subValue: 'Consecutive days',
      icon: <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />,
      bg: 'bg-amber-50/60 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`p-4 sm:p-5 rounded-3xl border transition-all duration-200 bg-white/70 dark:bg-slate-900/70 shadow-soft dark:shadow-soft-dark backdrop-blur-sm ${c.bg}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {c.label}
            </span>
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm">
              {c.icon}
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {c.value}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
            {c.subValue}
          </div>
        </div>
      ))}
    </div>
  );
}
