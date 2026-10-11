import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import {
  type PomodoroMode,
  type PomodoroStatus,
  type PomodoroSettings,
  type PomodoroDaily,
  type SavedTimerState,
  DEFAULT_POMODORO_SETTINGS,
  POMODORO_MODE_LABELS,
} from '../types/pomodoro';
import { pomodoroAudio } from '../utils/pomodoroAudio';
import { getLocalDateString } from '../utils/dateUtils';
import { getStudyLog, recordCompletedPomodoro } from '../utils/studyStats';

const SETTINGS_KEY = 'arrow_pomodoro_settings';
const DAILY_KEY = 'arrow_pomodoro_daily';
const STATE_KEY = 'arrow_pomodoro_state';
const MUTED_KEY = 'arrow_pomodoro_muted';

function getTodayDateString(): string {
  return getLocalDateString();
}

export function formatMMSS(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function getDurationMs(mode: PomodoroMode, settings: PomodoroSettings): number {
  switch (mode) {
    case 'pomodoro':
      return Math.max(1, settings.pomodoroMinutes) * 60 * 1000;
    case 'shortBreak':
      return Math.max(1, settings.shortBreakMinutes) * 60 * 1000;
    case 'longBreak':
      return Math.max(1, settings.longBreakMinutes) * 60 * 1000;
    default:
      return 25 * 60 * 1000;
  }
}

interface PomodoroContextValue {
  mode: PomodoroMode;
  status: PomodoroStatus;
  remainingMs: number;
  formattedTime: string;
  pomodorosToday: number;
  settings: PomodoroSettings;
  isMuted: boolean;
  isPopupOpen: boolean;
  openPopup: () => void;
  closePopup: () => void;
  start: () => void;
  pause: () => void;
  toggleStartPause: () => void;
  switchMode: (newMode: PomodoroMode) => void;
  resetCurrentTimer: () => void;
  toggleMute: () => void;
  updateSettings: (newSettings: Partial<PomodoroSettings>) => void;
  resetSettings: () => void;
}

const PomodoroContext = createContext<PomodoroContextValue | null>(null);

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  // 1. Settings state
  const [settings, setSettings] = useState<PomodoroSettings>(() => {
    if (typeof window === 'undefined') return DEFAULT_POMODORO_SETTINGS;
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return DEFAULT_POMODORO_SETTINGS;
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_POMODORO_SETTINGS,
        ...parsed,
      };
    } catch {
      return DEFAULT_POMODORO_SETTINGS;
    }
  });

  // 2. Muted state
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(MUTED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // 3. Daily completed Pomodoros count (#N) derived from study log
  const [pomodorosToday, setPomodorosToday] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const today = getTodayDateString();
      const studyLog = getStudyLog();
      if (studyLog[today]) {
        return studyLog[today].pomodoros;
      }
      const raw = localStorage.getItem(DAILY_KEY);
      if (!raw) return 0;
      const parsed: PomodoroDaily = JSON.parse(raw);
      return parsed.date === today && typeof parsed.count === 'number' ? parsed.count : 0;
    } catch {
      return 0;
    }
  });

  // 4. Timer state
  const [mode, setMode] = useState<PomodoroMode>('pomodoro');
  const [status, setStatus] = useState<PomodoroStatus>('idle');
  const [remainingMs, setRemainingMs] = useState<number>(() => {
    return getDurationMs('pomodoro', settings);
  });
  const endTimeRef = useRef<number | null>(null);

  // Popup open/closed
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Original document title preservation
  const originalTitleRef = useRef<string>('');

  useEffect(() => {
    if (typeof document !== 'undefined') {
      originalTitleRef.current = document.title || 'Arrow · Goal & Roadmap Tracker';
    }
  }, []);

  // Sync daily count to localStorage
  const saveDailyCount = useCallback((count: number) => {
    if (typeof window === 'undefined') return;
    try {
      const payload: PomodoroDaily = {
        date: getTodayDateString(),
        count,
      };
      localStorage.setItem(DAILY_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to save daily pomodoro count:', e);
    }
  }, []);

  // Restore saved timer state on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (!raw) return;
      const saved: SavedTimerState = JSON.parse(raw);
      const savedMode = saved.mode || 'pomodoro';

      if (saved.status === 'running' && saved.endTime) {
        const now = Date.now();
        if (now >= saved.endTime) {
          // Finished while app was closed -> treat as finished without ringing bell
          if (savedMode === 'pomodoro') {
            const today = getTodayDateString();
            const updatedLog = recordCompletedPomodoro(settings.pomodoroMinutes, today);
            const nextCount = updatedLog[today]?.pomodoros || 1;
            setPomodorosToday(nextCount);
            saveDailyCount(nextCount);

            const nextMode: PomodoroMode =
              nextCount % settings.longBreakInterval === 0 ? 'longBreak' : 'shortBreak';
            setMode(nextMode);
            setStatus('paused');
            setRemainingMs(getDurationMs(nextMode, settings));
          } else {
            setMode('pomodoro');
            setStatus('paused');
            setRemainingMs(getDurationMs('pomodoro', settings));
          }
          endTimeRef.current = null;
        } else {
          // Still running
          setMode(savedMode);
          setStatus('running');
          endTimeRef.current = saved.endTime;
          setRemainingMs(Math.max(0, saved.endTime - now));
        }
      } else if (saved.status === 'paused') {
        setMode(savedMode);
        setStatus('paused');
        setRemainingMs(
          typeof saved.remainingMs === 'number' && saved.remainingMs > 0
            ? saved.remainingMs
            : getDurationMs(savedMode, settings)
        );
        endTimeRef.current = null;
      }
    } catch (e) {
      console.warn('Failed to restore saved timer state:', e);
    }
  }, [settings, saveDailyCount]);

  // Persist timer state to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const payload: SavedTimerState = {
        mode,
        status,
        endTime: status === 'running' ? endTimeRef.current : null,
        remainingMs,
        lastSavedAt: Date.now(),
      };
      localStorage.setItem(STATE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to save timer state:', e);
    }
  }, [mode, status, remainingMs]);

  // Check midnight rollover periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const today = getTodayDateString();
      try {
        const raw = localStorage.getItem(DAILY_KEY);
        if (raw) {
          const parsed: PomodoroDaily = JSON.parse(raw);
          if (parsed.date !== today) {
            setPomodorosToday(0);
            saveDailyCount(0);
          }
        }
      } catch {
        // ignore
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [saveDailyCount]);

  // Keep pomodorosToday in sync when stats are updated
  useEffect(() => {
    const handleStatsUpdated = () => {
      const today = getTodayDateString();
      const studyLog = getStudyLog();
      setPomodorosToday(studyLog[today]?.pomodoros || 0);
    };
    window.addEventListener('arrow_stats_updated', handleStatsUpdated);
    return () => window.removeEventListener('arrow_stats_updated', handleStatsUpdated);
  }, []);

  // Update document title
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (status === 'running') {
      document.title = `${formatMMSS(remainingMs)} · ${POMODORO_MODE_LABELS[mode]}`;
    } else if (status === 'paused') {
      document.title = `[Paused] ${formatMMSS(remainingMs)} · ${POMODORO_MODE_LABELS[mode]}`;
    } else {
      if (originalTitleRef.current) {
        document.title = originalTitleRef.current;
      }
    }
  }, [status, remainingMs, mode]);

  // Timer Tick Loop (every 250ms)
  useEffect(() => {
    if (status !== 'running') return;

    const timer = setInterval(() => {
      if (!endTimeRef.current) return;

      const now = Date.now();
      const diff = endTimeRef.current - now;

      if (diff <= 0) {
        // Session complete!
        clearInterval(timer);
        endTimeRef.current = null;

        // 1. Play twin bell sound if not muted
        if (!isMuted) {
          pomodoroAudio.playTwinBell();
        }

        // 2. Check daily rollover and record study log
        const today = getTodayDateString();

        if (mode === 'pomodoro') {
          const updatedLog = recordCompletedPomodoro(settings.pomodoroMinutes, today);
          const newCount = updatedLog[today]?.pomodoros || 1;
          setPomodorosToday(newCount);
          saveDailyCount(newCount);

          // Auto-switch to break
          const nextMode: PomodoroMode =
            newCount % settings.longBreakInterval === 0 ? 'longBreak' : 'shortBreak';
          setMode(nextMode);
          setStatus('paused'); // Wait paused for user manual start
          setRemainingMs(getDurationMs(nextMode, settings));
        } else {
          // Break finished -> auto-switch back to Pomodoro
          setMode('pomodoro');
          setStatus('paused'); // Wait paused for user manual start
          setRemainingMs(getDurationMs('pomodoro', settings));
        }
      } else {
        setRemainingMs(diff);
      }
    }, 250);

    return () => clearInterval(timer);
  }, [status, mode, isMuted, pomodorosToday, settings, saveDailyCount]);

  // Actions
  const start = useCallback(() => {
    pomodoroAudio.init(); // Satisfy browser autoplay restriction on user click
    let targetMs = remainingMs;
    if (status === 'idle') {
      targetMs = getDurationMs(mode, settings);
    }
    endTimeRef.current = Date.now() + targetMs;
    setStatus('running');
  }, [mode, remainingMs, settings, status]);

  const pause = useCallback(() => {
    if (status === 'running') {
      const remaining = endTimeRef.current
        ? Math.max(0, endTimeRef.current - Date.now())
        : remainingMs;
      endTimeRef.current = null;
      setRemainingMs(remaining);
      setStatus('paused');
    }
  }, [remainingMs, status]);

  const toggleStartPause = useCallback(() => {
    if (status === 'running') {
      pause();
    } else {
      start();
    }
  }, [status, pause, start]);

  const switchMode = useCallback(
    (newMode: PomodoroMode) => {
      // Switching tabs manually stops running and resets timer
      endTimeRef.current = null;
      setMode(newMode);
      setStatus('idle');
      setRemainingMs(getDurationMs(newMode, settings));
    },
    [settings]
  );

  const resetCurrentTimer = useCallback(() => {
    endTimeRef.current = null;
    setStatus('idle');
    setRemainingMs(getDurationMs(mode, settings));
  }, [mode, settings]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(MUTED_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const updateSettings = useCallback(
    (newSettings: Partial<PomodoroSettings>) => {
      setSettings((prev) => {
        const merged: PomodoroSettings = {
          ...prev,
          ...newSettings,
        };
        try {
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
        } catch (e) {
          console.warn('Failed to save pomodoro settings:', e);
        }

        // If currently idle, update remaining display immediately
        if (status === 'idle') {
          setRemainingMs(getDurationMs(mode, merged));
        }

        return merged;
      });
    },
    [mode, status]
  );

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_POMODORO_SETTINGS);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_POMODORO_SETTINGS));
    } catch {
      // ignore
    }
    if (status === 'idle') {
      setRemainingMs(getDurationMs(mode, DEFAULT_POMODORO_SETTINGS));
    }
  }, [mode, status]);

  const openPopup = useCallback(() => setIsPopupOpen(true), []);
  const closePopup = useCallback(() => setIsPopupOpen(false), []);

  return (
    <PomodoroContext.Provider
      value={{
        mode,
        status,
        remainingMs,
        formattedTime: formatMMSS(remainingMs),
        pomodorosToday,
        settings,
        isMuted,
        isPopupOpen,
        openPopup,
        closePopup,
        start,
        pause,
        toggleStartPause,
        switchMode,
        resetCurrentTimer,
        toggleMute,
        updateSettings,
        resetSettings,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoro(): PomodoroContextValue {
  const ctx = useContext(PomodoroContext);
  if (!ctx) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return ctx;
}
