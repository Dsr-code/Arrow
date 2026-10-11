export type PomodoroMode = 'pomodoro' | 'shortBreak' | 'longBreak';

export type PomodoroStatus = 'idle' | 'running' | 'paused';

export interface PomodoroSettings {
  pomodoroMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
}

export interface PomodoroDaily {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface SavedTimerState {
  mode: PomodoroMode;
  status: PomodoroStatus;
  endTime: number | null;
  remainingMs: number;
  lastSavedAt: number;
}

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  pomodoroMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
};

export const POMODORO_MODE_LABELS: Record<PomodoroMode, string> = {
  pomodoro: 'Focus',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
};

export const POMODORO_MODE_TITLES: Record<PomodoroMode, string> = {
  pomodoro: 'Pomodoro',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
};
