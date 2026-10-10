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
      icon: <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      iconBg: 'bg-blue-500/10 dark:bg-blue-400/15 border-blue-500/20 text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Completed Days',
      value: stats.totalCompletedDays,
      subValue: `${stats.totalDays} total days`,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      iconBg: 'bg-emerald-500/10 dark:bg-emerald-400/15 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Overall Progress',
      value: `${stats.overallPercentage}%`,
      subValue: `${stats.completedGoalsCount} completed goal${stats.completedGoalsCount === 1 ? '' : 's'}`,
      icon: <TrendingUp className="w-5 h-5 text-sky-600 dark:text-sky-400" />,
      iconBg: 'bg-sky-500/10 dark:bg-sky-400/15 border-sky-500/20 text-sky-600 dark:text-sky-400',
    },
    {
      label: 'Streak',
      value: `🔥 ${stats.highestStreak}`,
      subValue: 'Consecutive days',
      icon: <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />,
      iconBg: 'bg-amber-500/10 dark:bg-amber-400/15 border-amber-500/20 text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
      {cards.map((c) => (
        <div
          key={c.label}
          className="spatial-card p-4 sm:p-5 rounded-3xl relative overflow-hidden group"
        >
          {/* Subtle top specular shimmer line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 dark:via-sky-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {c.label}
            </span>
            <div className={`p-2 rounded-2xl border shadow-sm ${c.iconBg}`}>
              {c.icon}
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {c.value}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            {c.subValue}
          </div>
        </div>
      ))}
    </div>
  );
}
