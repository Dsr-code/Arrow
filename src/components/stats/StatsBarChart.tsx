import { useState } from 'react';
import type { ChartBucket } from '../../types/stats';
import { formatHoursAndMinutes } from '../../utils/dateUtils';

interface StatsBarChartProps {
  buckets: ChartBucket[];
}

export function StatsBarChart({ buckets }: StatsBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxMinutes = Math.max(...buckets.map((b) => b.minutes), 60);
  const totalMinutes = buckets.reduce((acc, b) => acc + b.minutes, 0);

  // Determine label step for month view (when there are > 16 days) to prevent crowding
  const isMonthView = buckets.length > 20;

  return (
    <div className="relative w-full">
      {/* Empty State Banner if no activity */}
      {totalMinutes === 0 && (
        <div className="text-center py-3 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          No study activity in this period yet.
        </div>
      )}

      {/* Chart Canvas */}
      <div className="relative h-48 sm:h-56 w-full pt-6 pb-6 px-1 flex items-end justify-between gap-1 sm:gap-2">
        {/* Y-Axis guide lines */}
        <div className="absolute inset-x-0 top-6 bottom-6 pointer-events-none flex flex-col justify-between opacity-30">
          <div className="border-b border-dashed border-slate-300 dark:border-slate-700 w-full" />
          <div className="border-b border-dashed border-slate-300 dark:border-slate-700 w-full" />
          <div className="border-b border-slate-300 dark:border-slate-700 w-full" />
        </div>

        {/* Bars */}
        {buckets.map((bucket, index) => {
          const heightPercent = maxMinutes > 0 ? (bucket.minutes / maxMinutes) * 100 : 0;
          const isHovered = hoveredIndex === index;

          // Format tooltip content
          const timeText = formatHoursAndMinutes(bucket.minutes);
          const pomodoroText = `${bucket.pomodoros} pomodoro${bucket.pomodoros === 1 ? '' : 's'}`;
          const dayText = `${bucket.daysCompleted} day${bucket.daysCompleted === 1 ? '' : 's'} completed`;
          const tooltipContent = `${timeText} · ${pomodoroText} · ${dayText}`;

          // For Month view with ~31 bars, show labels on days 1, 5, 10, 15, 20, 25, last day
          const showXLabel =
            !isMonthView ||
            index === 0 ||
            (index + 1) % 5 === 0 ||
            index === buckets.length - 1;

          return (
            <div
              key={bucket.key}
              className="relative flex-1 h-full flex flex-col justify-end items-center group cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => setHoveredIndex(isHovered ? null : index)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div
                  className="absolute bottom-full mb-2 z-30 pointer-events-none transform -translate-x-1/2 left-1/2 min-w-[170px] max-w-[240px] p-2.5 rounded-2xl bg-slate-900/95 dark:bg-slate-950/95 text-white text-[11px] shadow-xl border border-slate-700/60 backdrop-blur-md transition-all text-center"
                  style={{
                    // Prevent tooltip from overflowing edges on first/last bars
                    left: index < 2 ? '30%' : index > buckets.length - 3 ? '70%' : '50%',
                  }}
                >
                  <div className="font-bold text-slate-200 border-b border-slate-700/70 pb-1 mb-1">
                    {bucket.tooltipTitle}
                  </div>
                  <div className="font-semibold text-blue-400">{tooltipContent}</div>
                </div>
              )}

              {/* The Visual Bar */}
              <div className="w-full max-w-[36px] flex flex-col justify-end h-full">
                <div
                  style={{
                    height: bucket.minutes > 0 ? `${Math.max(8, heightPercent)}%` : '4px',
                  }}
                  className={`w-full rounded-t-xl transition-all duration-300 relative ${
                    bucket.minutes > 0
                      ? isHovered
                        ? 'bg-gradient-to-t from-blue-600 via-sky-500 to-sky-300 dark:from-blue-500 dark:to-sky-300 shadow-md shadow-blue-500/40 scale-y-105'
                        : 'bg-gradient-to-t from-blue-600/85 to-sky-500/90 dark:from-blue-600 dark:to-sky-400'
                      : 'bg-slate-200 dark:bg-slate-800/80 rounded-full'
                  }`}
                >
                  {bucket.minutes > 0 && (
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-white/60 rounded-t-xl" />
                  )}
                </div>
              </div>

              {/* X-Axis Label */}
              <div className="mt-2 text-center select-none w-full truncate">
                {showXLabel ? (
                  <span
                    className={`text-[10px] sm:text-xs font-semibold block truncate ${
                      isHovered
                        ? 'text-blue-600 dark:text-blue-400 font-bold'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {bucket.label}
                  </span>
                ) : (
                  <span className="text-[10px] text-transparent select-none">·</span>
                )}
                {bucket.subLabel && (
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 block -mt-0.5">
                    {bucket.subLabel}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
