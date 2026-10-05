export type ResourceType = 'youtube' | 'practice' | 'generic';

export interface Resource {
  id: string;
  url: string;
  type: ResourceType;
  title?: string;
}

export interface DayLog {
  text: string;
  updatedAt: string; // ISO 8601 string
}

export interface Day {
  dayNumber: number;
  topic: string;
  resources: Resource[];
  completed: boolean;
  completedAt?: string; // ISO 8601 string
  log?: DayLog;
}

export interface Goal {
  id: string;
  name: string;
  totalDays: number;
  createdAt: string; // ISO 8601 string
  days: Day[];
  category?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  targetDate?: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
  duration?: number;
}
