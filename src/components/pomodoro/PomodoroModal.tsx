import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Timer,
  ArrowLeft,
} from 'lucide-react';
import { usePomodoro } from '../../context/PomodoroContext';
import { POMODORO_MODE_LABELS } from '../../types/pomodoro';

export function PomodoroModal() {
  const {
    mode,
    status,
    formattedTime,
    pomodorosToday,
    settings,
    isMuted,
    isPopupOpen,
    closePopup,
    toggleStartPause,
    switchMode,
    resetCurrentTimer,
    toggleMute,
    updateSettings,
    resetSettings,
  } = usePomodoro();

  const [isSettingsView, setIsSettingsView] = useState(false);

  // Local settings draft for validation and editing
  const [formValues, setFormValues] = useState<{
    pomodoro: string;
    shortBreak: string;
    longBreak: string;
    interval: string;
  }>({
    pomodoro: String(settings.pomodoroMinutes),
    shortBreak: String(settings.shortBreakMinutes),
    longBreak: String(settings.longBreakMinutes),
    interval: String(settings.longBreakInterval),
  });

  const [formError, setFormError] = useState<string | null>(null);

  // Sync draft with real settings when opening settings
  useEffect(() => {
    if (isSettingsView) {
      setFormValues({
        pomodoro: String(settings.pomodoroMinutes),
        shortBreak: String(settings.shortBreakMinutes),
        longBreak: String(settings.longBreakMinutes),
        interval: String(settings.longBreakInterval),
      });
      setFormError(null);
    }
  }, [isSettingsView, settings]);

  // Spacebar and Escape key handling
  useEffect(() => {
    if (!isPopupOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isSettingsView) {
          setIsSettingsView(false);
        } else {
          closePopup();
        }
        return;
      }

      // Spacebar toggles start/pause only if not focused on an input/button
      if (e.code === 'Space' || e.key === ' ') {
        const target = e.target as HTMLElement | null;
        const isInput =
          target?.tagName === 'INPUT' ||
          target?.tagName === 'TEXTAREA' ||
          target?.isContentEditable;

        if (!isInput) {
          e.preventDefault();
          toggleStartPause();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPopupOpen, isSettingsView, closePopup, toggleStartPause]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const pomo = parseInt(formValues.pomodoro, 10);
    const shortB = parseInt(formValues.shortBreak, 10);
    const longB = parseInt(formValues.longBreak, 10);
    const intv = parseInt(formValues.interval, 10);

    if (isNaN(pomo) || pomo < 1 || pomo > 180) {
      setFormError('Pomodoro duration must be a whole number between 1 and 180 minutes.');
      return;
    }
    if (isNaN(shortB) || shortB < 1 || shortB > 180) {
      setFormError('Short break duration must be a whole number between 1 and 180 minutes.');
      return;
    }
    if (isNaN(longB) || longB < 1 || longB > 180) {
      setFormError('Long break duration must be a whole number between 1 and 180 minutes.');
      return;
    }
    if (isNaN(intv) || intv < 1 || intv > 50) {
      setFormError('Long break interval must be between 1 and 50 pomodoros.');
      return;
    }

    updateSettings({
      pomodoroMinutes: pomo,
      shortBreakMinutes: shortB,
      longBreakMinutes: longB,
      longBreakInterval: intv,
    });

    setIsSettingsView(false);
  };

  const handleResetDefaults = () => {
    resetSettings();
    setFormValues({
      pomodoro: '25',
      shortBreak: '5',
      longBreak: '15',
      interval: '4',
    });
    setFormError(null);
  };

  if (!isPopupOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md"
        onClick={closePopup}
        role="dialog"
        aria-modal="true"
        aria-label="Pomodoro Timer"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md rounded-3xl spatial-glass p-6 sm:p-8 overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800"
        >
          {/* Subtle top edge highlight */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 dark:via-sky-400/50 to-transparent" />

          {/* VIEW: SETTINGS */}
          {isSettingsView ? (
            <div>
              {/* Settings Header */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200/60 dark:border-slate-800/80">
                <button
                  onClick={() => setIsSettingsView(false)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Settings className="w-4 h-4 text-blue-500" />
                  <span>Timer Settings</span>
                </h2>
                <button
                  onClick={closePopup}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Close popup"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Settings Form */}
              <form onSubmit={handleSaveSettings} className="space-y-4">
                {formError && (
                  <div className="p-3 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-900/50">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Pomodoro Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={formValues.pomodoro}
                    onChange={(e) =>
                      setFormValues((prev) => ({ ...prev, pomodoro: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Short Break (min)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={formValues.shortBreak}
                      onChange={(e) =>
                        setFormValues((prev) => ({ ...prev, shortBreak: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Long Break (min)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={formValues.longBreak}
                      onChange={(e) =>
                        setFormValues((prev) => ({ ...prev, longBreak: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Long break after every N pomodoros
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formValues.interval}
                    onChange={(e) =>
                      setFormValues((prev) => ({ ...prev, interval: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all font-medium"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Default is every 4 pomodoros.</p>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-between gap-3 pt-3">
                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    className="px-4 py-2.5 text-xs font-semibold rounded-2xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    Reset to defaults
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 text-xs font-bold rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/25 hover:bg-blue-500 transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* VIEW: TIMER */
            <div>
              {/* Header: Controls (Mute, Settings, Close) */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-2xl bg-blue-500/10 dark:bg-blue-400/15 border border-blue-500/20 text-blue-600 dark:text-blue-400 shadow-sm">
                    <Timer className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    Pomodoro
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={toggleMute}
                    title={isMuted ? 'Unmute Bell Ring' : 'Mute Bell Ring'}
                    className={`p-2 rounded-2xl border transition-all ${
                      isMuted
                        ? 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                        : 'border-blue-200/60 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30'
                    }`}
                    aria-label={isMuted ? 'Unmute bell ring' : 'Mute bell ring'}
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => setIsSettingsView(true)}
                    title="Timer Settings"
                    className="p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    aria-label="Open pomodoro settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>

                  <button
                    onClick={closePopup}
                    title="Close (Esc)"
                    className="p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    aria-label="Close popup"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Three Tabs: Pomodoro, Short Break, Long Break */}
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-100/80 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 mb-8">
                {(
                  [
                    { key: 'pomodoro', label: 'Pomodoro' },
                    { key: 'shortBreak', label: 'Short Break' },
                    { key: 'longBreak', label: 'Long Break' },
                  ] as const
                ).map((tab) => {
                  const isActive = mode === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => switchMode(tab.key)}
                      className={`py-2 px-2 text-xs font-bold rounded-xl transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Big Time Display */}
              <div className="text-center my-6">
                <div className="font-mono text-6xl sm:text-7xl font-black text-slate-900 dark:text-white tracking-tight select-none">
                  {formattedTime}
                </div>
                <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  {status === 'running'
                    ? `Running · ${POMODORO_MODE_LABELS[mode]}`
                    : status === 'paused'
                    ? `Paused · ${POMODORO_MODE_LABELS[mode]}`
                    : `${POMODORO_MODE_LABELS[mode]} Mode`}
                </div>
              </div>

              {/* Large START / PAUSE Button */}
              <div className="flex items-center justify-center gap-3 my-6">
                <button
                  onClick={toggleStartPause}
                  className={`w-44 py-3.5 px-6 rounded-2xl text-base font-black tracking-wide flex items-center justify-center gap-2.5 transition-all shadow-lg active:scale-95 ${
                    status === 'running'
                      ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-white shadow-slate-900/10'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/30 hover:shadow-blue-500/40'
                  }`}
                  aria-label={status === 'running' ? 'Pause timer' : 'Start timer'}
                >
                  {status === 'running' ? (
                    <>
                      <Pause className="w-5 h-5 fill-current" />
                      <span>PAUSE</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                      <span>START</span>
                    </>
                  )}
                </button>

                {/* Reset button visible when paused */}
                {status === 'paused' && (
                  <button
                    onClick={resetCurrentTimer}
                    title="Reset timer to beginning"
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                    aria-label="Reset timer"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Bottom Info: #N count & Message */}
              <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800/80 text-center space-y-1">
                <div className="text-xs font-black text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/40 font-mono text-[11px]">
                    #{pomodorosToday}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">
                    completed today
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {mode === 'pomodoro' ? 'Time to focus!' : 'Time for a break!'}
                </p>
                <p className="text-[11px] text-slate-400 pt-1 font-medium">
                  Press <kbd className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-[10px] border border-slate-200 dark:border-slate-700">Space</kbd> to toggle start/pause
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
