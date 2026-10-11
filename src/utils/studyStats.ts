import type { Goal } from '../types/goal';
import type {
  StudyLogMap,
  DayCompletionRecord,
  StatsFilterView,
  ChartBucket,
  PeriodStats,
  ArisStatsSummary,
} from '../types/stats';
import {
  getLocalDateString,
  getMondayOfWeek,
  getSundayOfWeek,
  formatWeekRangeLabel,
  formatMonthLabel,
  formatYearLabel,
  formatHoursAndMinutes,
} from './dateUtils';

export const STUDY_LOG_KEY = 'arrow_study_log';
export const COMPLETION_LOG_KEY = 'arrow_completion_log';

/**
 * Reads the study log map from localStorage.
 */
export function getStudyLog(): StudyLogMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STUDY_LOG_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (e) {
    console.warn('Failed to parse study log:', e);
    return {};
  }
}

/**
 * Saves the study log map to localStorage.
 */
export function saveStudyLog(log: StudyLogMap): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STUDY_LOG_KEY, JSON.stringify(log));
  } catch (e) {
    console.warn('Failed to save study log:', e);
  }
}

/**
 * Records a completed Pomodoro session into the study log.
 * Stores minutes at completion time so future settings changes do not affect past history.
 */
export function recordCompletedPomodoro(
  minutes: number,
  targetDateStr?: string
): StudyLogMap {
  const log = getStudyLog();
  const dateStr = targetDateStr || getLocalDateString();
  const existing = log[dateStr] || { date: dateStr, pomodoros: 0, minutes: 0 };

  const updated: StudyLogMap = {
    ...log,
    [dateStr]: {
      date: dateStr,
      pomodoros: existing.pomodoros + 1,
      minutes: existing.minutes + Math.max(1, Math.round(minutes)),
    },
  };

  saveStudyLog(updated);

  // Dispatch custom event for live reactive UI updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('arrow_stats_updated'));
  }

  return updated;
}

/**
 * Reads explicit completion records from localStorage.
 */
export function getStoredCompletionLog(): DayCompletionRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(COMPLETION_LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to parse completion log:', e);
    return [];
  }
}

/**
 * Saves explicit completion records to localStorage.
 */
export function saveStoredCompletionLog(records: DayCompletionRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(COMPLETION_LOG_KEY, JSON.stringify(records));
  } catch (e) {
    console.warn('Failed to save completion log:', e);
  }
}

/**
 * Extracts and reconciles all completed days from active goals.
 * Accurately tracks dated vs undated completed days.
 */
export function extractCompletionsFromGoals(goals: Goal[]): {
  dated: DayCompletionRecord[];
  undated: DayCompletionRecord[];
} {
  const dated: DayCompletionRecord[] = [];
  const undated: DayCompletionRecord[] = [];

  for (const goal of goals || []) {
    for (const day of goal.days || []) {
      if (day.completed) {
        if (day.completedAt) {
          let dateStr: string | undefined;
          try {
            dateStr = getLocalDateString(new Date(day.completedAt));
          } catch {
            dateStr = undefined;
          }

          if (dateStr) {
            dated.push({
              id: `${goal.id}_${day.dayNumber}`,
              goalId: goal.id,
              goalTitle: goal.name,
              dayNumber: day.dayNumber,
              topic: day.topic,
              completedAt: day.completedAt,
              date: dateStr,
            });
            continue;
          }
        }

        // Undated completion (no completedAt date, e.g. legacy or imported)
        undated.push({
          id: `${goal.id}_${day.dayNumber}`,
          goalId: goal.id,
          goalTitle: goal.name,
          dayNumber: day.dayNumber,
          topic: day.topic,
          completedAt: undefined,
          date: undefined,
        });
      }
    }
  }

  // Sort dated completions newest first
  dated.sort((a, b) => {
    const timeA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
    const timeB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
    return timeB - timeA;
  });

  return { dated, undated };
}

/**
 * Generates chart buckets and aggregates stats for a given view & anchor date.
 */
export function calculatePeriodStats(
  view: StatsFilterView,
  anchorDate: Date,
  studyLog: StudyLogMap,
  completions: { dated: DayCompletionRecord[]; undated: DayCompletionRecord[] }
): PeriodStats {
  const buckets: ChartBucket[] = [];
  let periodLabel = '';
  let startDateStr: string | undefined;
  let endDateStr: string | undefined;

  let filteredDatedCompletions: DayCompletionRecord[] = [];
  let relevantUndatedCompletions: DayCompletionRecord[] = [];

  if (view === 'week') {
    const monday = getMondayOfWeek(anchorDate);
    const sunday = getSundayOfWeek(monday);
    startDateStr = getLocalDateString(monday);
    endDateStr = getLocalDateString(sunday);
    periodLabel = formatWeekRangeLabel(monday, sunday);

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      const dStr = getLocalDateString(d);
      const logEntry = studyLog[dStr];
      const minutes = logEntry ? logEntry.minutes : 0;
      const pomodoros = logEntry ? logEntry.pomodoros : 0;

      const dayCompletions = completions.dated.filter((c) => c.date === dStr).length;

      buckets.push({
        key: dStr,
        label: dayNames[i],
        subLabel: `${d.getDate()}`,
        tooltipTitle: `${dayNames[i]}, ${d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`,
        minutes,
        hours: Number((minutes / 60).toFixed(2)),
        pomodoros,
        daysCompleted: dayCompletions,
      });
    }

    filteredDatedCompletions = completions.dated.filter(
      (c) => c.date && c.date >= startDateStr! && c.date <= endDateStr!
    );
  } else if (view === 'month') {
    const year = anchorDate.getFullYear();
    const month = anchorDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month, daysInMonth);
    startDateStr = getLocalDateString(firstDay);
    endDateStr = getLocalDateString(lastDay);
    periodLabel = formatMonthLabel(anchorDate);

    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const d = new Date(year, month, dayNum);
      const dStr = getLocalDateString(d);
      const logEntry = studyLog[dStr];
      const minutes = logEntry ? logEntry.minutes : 0;
      const pomodoros = logEntry ? logEntry.pomodoros : 0;

      const dayCompletions = completions.dated.filter((c) => c.date === dStr).length;

      buckets.push({
        key: dStr,
        label: `${dayNum}`,
        subLabel: undefined,
        tooltipTitle: d.toLocaleDateString('en-US', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        minutes,
        hours: Number((minutes / 60).toFixed(2)),
        pomodoros,
        daysCompleted: dayCompletions,
      });
    }

    filteredDatedCompletions = completions.dated.filter(
      (c) => c.date && c.date >= startDateStr! && c.date <= endDateStr!
    );
  } else if (view === 'year') {
    const year = anchorDate.getFullYear();
    startDateStr = `${year}-01-01`;
    endDateStr = `${year}-12-31`;
    periodLabel = formatYearLabel(anchorDate);

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    for (let m = 0; m < 12; m++) {
      const prefix = `${year}-${String(m + 1).padStart(2, '0')}`;
      let mMinutes = 0;
      let mPomodoros = 0;
      let mCompletions = 0;

      for (const [dStr, entry] of Object.entries(studyLog)) {
        if (dStr.startsWith(prefix)) {
          mMinutes += entry.minutes;
          mPomodoros += entry.pomodoros;
        }
      }

      for (const c of completions.dated) {
        if (c.date && c.date.startsWith(prefix)) {
          mCompletions++;
        }
      }

      const mDate = new Date(year, m, 1);
      buckets.push({
        key: prefix,
        label: monthNames[m],
        tooltipTitle: mDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        minutes: mMinutes,
        hours: Number((mMinutes / 60).toFixed(2)),
        pomodoros: mPomodoros,
        daysCompleted: mCompletions,
      });
    }

    filteredDatedCompletions = completions.dated.filter(
      (c) => c.date && c.date >= startDateStr! && c.date <= endDateStr!
    );
  } else {
    // All time view
    periodLabel = 'All Time';

    // Collect all year-month pairs
    const monthSet = new Set<string>();
    const now = new Date();
    // Default show at least the last 6 months up to current
    for (let offset = 5; offset >= 0; offset--) {
      const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      monthSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }

    for (const dStr of Object.keys(studyLog)) {
      if (dStr.length >= 7) {
        monthSet.add(dStr.slice(0, 7));
      }
    }

    for (const c of completions.dated) {
      if (c.date && c.date.length >= 7) {
        monthSet.add(c.date.slice(0, 7));
      }
    }

    const sortedMonths = Array.from(monthSet).sort();

    for (const ym of sortedMonths) {
      let mMinutes = 0;
      let mPomodoros = 0;
      let mCompletions = 0;

      for (const [dStr, entry] of Object.entries(studyLog)) {
        if (dStr.startsWith(ym)) {
          mMinutes += entry.minutes;
          mPomodoros += entry.pomodoros;
        }
      }

      for (const c of completions.dated) {
        if (c.date && c.date.startsWith(ym)) {
          mCompletions++;
        }
      }

      const [y, m] = ym.split('-').map(Number);
      const d = new Date(y, m - 1, 1);
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      const yearShort = String(y).slice(-2);

      buckets.push({
        key: ym,
        label: `${label} '${yearShort}`,
        tooltipTitle: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        minutes: mMinutes,
        hours: Number((mMinutes / 60).toFixed(2)),
        pomodoros: mPomodoros,
        daysCompleted: mCompletions,
      });
    }

    filteredDatedCompletions = completions.dated;
    relevantUndatedCompletions = completions.undated;
  }

  // Summary aggregation
  let totalMinutes = 0;
  let pomodorosCount = 0;
  let activeDaysCount = 0;

  if (view === 'all') {
    for (const entry of Object.values(studyLog)) {
      totalMinutes += entry.minutes;
      pomodorosCount += entry.pomodoros;
      if (entry.pomodoros > 0 || entry.minutes > 0) {
        activeDaysCount++;
      }
    }
  } else {
    for (const bucket of buckets) {
      totalMinutes += bucket.minutes;
      pomodorosCount += bucket.pomodoros;
      if (bucket.pomodoros > 0 || bucket.minutes > 0) {
        activeDaysCount++;
      }
    }
  }

  const daysCompletedCount =
    filteredDatedCompletions.length + (view === 'all' ? relevantUndatedCompletions.length : 0);

  const avgMinutesPerActiveDay =
    activeDaysCount > 0 ? Math.round(totalMinutes / activeDaysCount) : 0;

  return {
    view,
    periodLabel,
    startDateStr,
    endDateStr,
    totalMinutes,
    totalHoursFormatted: formatHoursAndMinutes(totalMinutes),
    pomodorosCount,
    daysCompletedCount,
    averageStudyPerActiveDayFormatted: formatHoursAndMinutes(avgMinutesPerActiveDay),
    activeDaysCount,
    buckets,
    datedCompletions: filteredDatedCompletions,
    undatedCompletions: relevantUndatedCompletions,
  };
}

/**
 * Calculates compact statistics for the AI bot context.
 * { minutesToday, minutesThisWeek, minutesThisMonth, pomodorosToday, daysCompletedThisWeek }
 */
export function getArisStatsSummary(
  studyLog: StudyLogMap,
  completions: { dated: DayCompletionRecord[]; undated: DayCompletionRecord[] }
): ArisStatsSummary {
  const now = new Date();
  const todayStr = getLocalDateString(now);

  const monday = getMondayOfWeek(now);
  const sunday = getSundayOfWeek(monday);
  const weekStart = getLocalDateString(monday);
  const weekEnd = getLocalDateString(sunday);

  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const todayEntry = studyLog[todayStr];
  const minutesToday = todayEntry ? todayEntry.minutes : 0;
  const pomodorosToday = todayEntry ? todayEntry.pomodoros : 0;

  let minutesThisWeek = 0;
  let minutesThisMonth = 0;

  for (const [dateStr, entry] of Object.entries(studyLog)) {
    if (dateStr >= weekStart && dateStr <= weekEnd) {
      minutesThisWeek += entry.minutes;
    }
    if (dateStr.startsWith(monthPrefix)) {
      minutesThisMonth += entry.minutes;
    }
  }

  const daysCompletedThisWeek = completions.dated.filter(
    (c) => c.date && c.date >= weekStart && c.date <= weekEnd
  ).length;

  return {
    minutesToday,
    minutesThisWeek,
    minutesThisMonth,
    pomodorosToday,
    daysCompletedThisWeek,
  };
}

/**
 * Calculates all-time totals for the dashboard card.
 */
export function getAllTimeTotals(
  studyLog: StudyLogMap,
  completions: { dated: DayCompletionRecord[]; undated: DayCompletionRecord[] }
): {
  totalMinutes: number;
  totalHoursFormatted: string;
  totalPomodoros: number;
  totalCompletedDays: number;
} {
  let totalMinutes = 0;
  let totalPomodoros = 0;

  for (const entry of Object.values(studyLog)) {
    totalMinutes += entry.minutes;
    totalPomodoros += entry.pomodoros;
  }

  const totalCompletedDays = completions.dated.length + completions.undated.length;

  return {
    totalMinutes,
    totalHoursFormatted: formatHoursAndMinutes(totalMinutes, true),
    totalPomodoros,
    totalCompletedDays,
  };
}
