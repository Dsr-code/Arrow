import { useState, useEffect, useMemo } from 'react';
import { Target, CheckCircle2, BarChart3, Clock } from 'lucide-react';
import type { Goal } from '../../types/goal';
import type { GlobalStats } from '../../utils/streak';
import { usePomodoro } from '../../context/PomodoroContext';
import { POMODORO_MODE_LABELS } from '../../types/pomodoro';
import {
  getStudyLog,
  extractCompletionsFromGoals,
  getAllTimeTotals,
} from '../../utils/studyStats';

interface GoalStatsBarProps {
  stats: GlobalStats;
  goals?: Goal[];
  onOpenStats?: () => void;
}

export function GoalStatsBar({ stats, goals = [], onOpenStats }: GoalStatsBarProps) {
  const { status, formattedTime, mode, openPopup } = usePomodoro();
  const [statsVersion, setStatsVersion] = useState(0);

  // Sync stats when updated
  useEffect(() => {
    const handleUpdate = () => setStatsVersion((v) => v + 1);
    window.addEventListener('arrow_stats_updated', handleUpdate);
    return () => window.removeEventListener('arrow_stats_updated', handleUpdate);
  }, []);

  const allTimeTotals = useMemo(() => {
    void statsVersion;
    const studyLog = getStudyLog();
    const completions = extractCompletionsFromGoals(goals);
    return getAllTimeTotals(studyLog, completions);
  }, [statsVersion, goals]);

  // Pomodoro card dynamic display values
  const isIdle = status === 'idle';
  const pomodoroDisplayTime = isIdle ? '00:00' : formattedTime;
  const pomodoroSubLabel = isIdle
    ? 'Focus session'
    : `${POMODORO_MODE_LABELS[mode]}${status === 'paused' ? ' · Paused' : ' · Running'}`;

  const cards = [
    {
      label: 'Active Roadmaps',
      value: stats.activeGoalsCount,
      subValue: `${stats.totalGoals} total`,
      icon: <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      iconBg:
        'bg-blue-500/10 dark:bg-blue-400/15 border-blue-500/20 text-blue-600 dark:text-blue-400',
      onClick: undefined,
      isInteractive: false,
    },
    {
      label: 'Completed Days',
      value: stats.totalCompletedDays,
      subValue: `${stats.totalDays} total days`,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      iconBg:
        'bg-emerald-500/10 dark:bg-emerald-400/15 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
      onClick: undefined,
      isInteractive: false,
    },
    {
      label: 'Overall Statistics',
      value: allTimeTotals.totalHoursFormatted,
      subValue: `${allTimeTotals.totalPomodoros} pomodoros · ${allTimeTotals.totalCompletedDays} days completed`,
      icon: <BarChart3 className="w-5 h-5 text-sky-600 dark:text-sky-400" />,
      iconBg:
        'bg-sky-500/10 dark:bg-sky-400/15 border-sky-500/20 text-sky-600 dark:text-sky-400',
      onClick: onOpenStats,
      isInteractive: true,
    },
    {
      label: 'Pomodoro',
      value: pomodoroDisplayTime,
      subValue: pomodoroSubLabel,
      icon: <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      iconBg:
        'bg-blue-500/10 dark:bg-blue-400/15 border-blue-500/20 text-blue-600 dark:text-blue-400',
      onClick: openPopup,
      isInteractive: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
      {cards.map((c) => (
        <div
          key={c.label}
          onClick={c.onClick}
          role={c.isInteractive ? 'button' : undefined}
          tabIndex={c.isInteractive ? 0 : undefined}
          onKeyDown={(e) => {
            if (c.isInteractive && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              c.onClick?.();
            }
          }}
          className={`spatial-card p-4 sm:p-5 rounded-3xl relative overflow-hidden group transition-all duration-200 ${
            c.isInteractive
              ? 'cursor-pointer hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10 select-none'
              : ''
          }`}
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
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
            {c.value}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium flex items-center justify-between">
            <span>{c.subValue}</span>
            {c.isInteractive && (
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                Open ↗
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
