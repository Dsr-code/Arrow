import { type StatsFilterView } from '../types/stats';

/**
 * Returns a local date string formatted as "YYYY-MM-DD"
 * strictly using the client's local timezone (never UTC) to prevent midnight shift bugs.
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses a "YYYY-MM-DD" local date string into a local Date object set at 00:00:00.
 */
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

/**
 * Finds the Monday of the week for a given date (weeks start on Monday).
 */
export function getMondayOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay(); // 0 is Sunday, 1 is Monday, ... 6 is Saturday
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Finds Sunday of the week given its Monday.
 */
export function getSundayOfWeek(monday: Date): Date {
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

/**
 * Formats week range label: e.g. "6 Oct - 12 Oct 2026"
 */
export function formatWeekRangeLabel(monday: Date, sunday: Date): string {
  const mMonth = monday.toLocaleDateString('en-US', { month: 'short' });
  const sMonth = sunday.toLocaleDateString('en-US', { month: 'short' });
  const mYear = monday.getFullYear();
  const sYear = sunday.getFullYear();

  if (mYear === sYear) {
    if (mMonth === sMonth) {
      return `${monday.getDate()} ${mMonth} - ${sunday.getDate()} ${sMonth} ${mYear}`;
    }
    return `${monday.getDate()} ${mMonth} - ${sunday.getDate()} ${sMonth} ${mYear}`;
  }
  return `${monday.getDate()} ${mMonth} ${mYear} - ${sunday.getDate()} ${sMonth} ${sYear}`;
}

/**
 * Formats month label: e.g. "October 2026"
 */
export function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Formats year label: e.g. "2026"
 */
export function formatYearLabel(date: Date): string {
  return String(date.getFullYear());
}

/**
 * Determines whether the given anchor date is in or past the current period
 * (used to disable the 'next' navigation button).
 */
export function isCurrentOrFuturePeriod(view: StatsFilterView, anchor: Date): boolean {
  const now = new Date();
  if (view === 'all') return true;

  if (view === 'week') {
    const currentMonday = getMondayOfWeek(now);
    const anchorMonday = getMondayOfWeek(anchor);
    return anchorMonday.getTime() >= currentMonday.getTime();
  }

  if (view === 'month') {
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const anchorYear = anchor.getFullYear();
    const anchorMonth = anchor.getMonth();
    return anchorYear > currentYear || (anchorYear === currentYear && anchorMonth >= currentMonth);
  }

  if (view === 'year') {
    return anchor.getFullYear() >= now.getFullYear();
  }

  return true;
}

/**
 * Navigates the anchor date backwards or forwards based on the active view.
 */
export function navigatePeriod(
  view: StatsFilterView,
  anchor: Date,
  direction: 'prev' | 'next'
): Date {
  const delta = direction === 'next' ? 1 : -1;
  const result = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate());

  if (view === 'week') {
    result.setDate(result.getDate() + delta * 7);
  } else if (view === 'month') {
    result.setMonth(result.getMonth() + delta);
    result.setDate(1); // Anchor to 1st of the month
  } else if (view === 'year') {
    result.setFullYear(result.getFullYear() + delta);
    result.setMonth(0, 1);
  }

  return result;
}

/**
 * Formats minutes into human-readable hours and minutes:
 * e.g. 150 -> "2h 30m", 45 -> "45m" (or "0h 45m" if alwaysShowHours is true).
 */
export function formatHoursAndMinutes(minutes: number, alwaysShowHours = false): string {
  const totalM = Math.max(0, Math.round(minutes));
  const h = Math.floor(totalM / 60);
  const m = totalM % 60;

  if (totalM === 0) {
    return alwaysShowHours ? '0h 0m' : '0m';
  }

  if (h === 0) {
    return alwaysShowHours ? `0h ${m}m` : `${m}m`;
  }

  return `${h}h ${m}m`;
}
