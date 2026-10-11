export interface StudyLogRecord {
  date: string; // "YYYY-MM-DD" local date
  pomodoros: number;
  minutes: number;
}

export type StudyLogMap = Record<string, StudyLogRecord>;

export interface DayCompletionRecord {
  id: string; // `${goalId}_${dayNumber}`
  goalId: string;
  goalTitle: string;
  dayNumber: number;
  topic: string;
  completedAt?: string; // ISO 8601 string
  date?: string; // "YYYY-MM-DD" local date
}

export type StatsFilterView = 'week' | 'month' | 'year' | 'all';

export interface ChartBucket {
  key: string;
  label: string; // e.g. "Mon", "15", "Oct", "Oct '26"
  subLabel?: string; // e.g. "12", "Mon 12"
  tooltipTitle: string; // e.g. "Mon, 12 Oct 2026"
  minutes: number;
  hours: number;
  pomodoros: number;
  daysCompleted: number;
}

export interface PeriodStats {
  view: StatsFilterView;
  periodLabel: string;
  startDateStr?: string;
  endDateStr?: string;
  totalMinutes: number;
  totalHoursFormatted: string;
  pomodorosCount: number;
  daysCompletedCount: number;
  averageStudyPerActiveDayFormatted: string;
  activeDaysCount: number;
  buckets: ChartBucket[];
  datedCompletions: DayCompletionRecord[];
  undatedCompletions: DayCompletionRecord[];
}

export interface ArisStatsSummary {
  minutesToday: number;
  minutesThisWeek: number;
  minutesThisMonth: number;
  pomodorosToday: number;
  daysCompletedThisWeek: number;
}

export interface BackupPayloadV2 {
  version: number;
  exportDate: string;
  goals: unknown[];
  studyLog?: StudyLogMap;
  completionLog?: DayCompletionRecord[];
}
