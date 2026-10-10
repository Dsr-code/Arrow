import { useState } from 'react';
import { Sun, Moon, Download, Upload, Monitor, User, Edit3, X, Check, Bot } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { InstallAppModal } from './InstallAppModal';
import { ImportModal } from './ImportModal';
import type { SharedRoadmapPayload } from '../../utils/shareUtils';
import { useToast } from '../../context/ToastContext';

interface HeaderProps {
  userName?: string;
  onUpdateUserName?: (newName: string) => void;
  onNavigateHome: () => void;
  globalStreak?: number;
  totalGoalsCount?: number;
  onExport: () => void;
  onImport: (json: string) => boolean;
  onImportSharedRoadmap?: (payload: SharedRoadmapPayload) => void;
  onToggleAris?: () => void;
  isArisOpen?: boolean;
}

export function Header({
  userName,
  onUpdateUserName,
  onNavigateHome,
  onExport,
  onImport,
  onImportSharedRoadmap,
  onToggleAris,
  isArisOpen,
}: HeaderProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { isInstallable, isStandalone, triggerInstall } = usePWAInstall();
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEditingNameModalOpen, setIsEditingNameModalOpen] = useState(false);
  const [nameInputValue, setNameInputValue] = useState(userName || '');
  const toast = useToast();

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInputValue.trim();
    if (!trimmed) return;
    if (onUpdateUserName) {
      onUpdateUserName(trimmed);
      toast.success('Name Updated', `Nice to see you, ${trimmed}!`);
    }
    setIsEditingNameModalOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/75 dark:bg-slate-900/75 border-b border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-colors">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo & User Name */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div
              onClick={onNavigateHome}
              className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group select-none shrink-0"
              title="Arrow Home"
            >
              <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-sky-400 p-0.5 shadow-md shadow-blue-500/25 border border-white/20 group-hover:scale-105 group-hover:shadow-blue-500/40 transition-all duration-300 flex items-center justify-center shrink-0">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white transform -rotate-45"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                    Arrow
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 shadow-sm">
                    Tracker
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 hidden md:block -mt-0.5 font-medium">
                  Aim. Track. Achieve.
                </p>
              </div>
            </div>

            {/* User Greeting Pill (click to edit name) */}
            {userName && (
              <button
                onClick={() => {
                  setNameInputValue(userName);
                  setIsEditingNameModalOpen(true);
                }}
                title={`Logged in as ${userName}. Click to change name.`}
                className="hidden sm:inline-flex items-center gap-1.5 ml-2 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/70 hover:border-blue-400 dark:hover:border-blue-500/60 hover:bg-white dark:hover:bg-slate-800 transition-all max-w-[160px] truncate shadow-sm"
              >
                <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="truncate">{userName}</span>
                <Edit3 className="w-3 h-3 text-slate-400 opacity-60 shrink-0" />
              </button>
            )}
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Aris AI Assistant Bot Button */}
            <button
              onClick={onToggleAris}
              title="Ask Aris (AI Assistant)"
              className={`p-2 sm:p-2.5 rounded-2xl text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100/80 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 hover:border-blue-300 dark:hover:border-blue-500/50 shadow-sm transition-all ${
                isArisOpen
                  ? 'ring-2 ring-blue-500/50 text-blue-600 dark:text-sky-400 bg-white dark:bg-slate-800 shadow-blue-500/10'
                  : ''
              }`}
              aria-label="Open Aris AI Assistant"
            >
              <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-sky-400" />
            </button>

            {/* Install Desktop App Button */}
            {!isStandalone && (
              <button
                onClick={() => {
                  if (isInstallable) {
                    triggerInstall();
                  } else {
                    setShowInstallModal(true);
                  }
                }}
                title="Download or install Arrow as desktop app"
                className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100/80 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 hover:border-blue-300 dark:hover:border-blue-500/50 shadow-sm transition-all"
              >
                <Monitor className="w-4 h-4 text-blue-500" />
                <span>Desktop App</span>
              </button>
            )}

            {/* Backup / Export button */}
            <button
              onClick={onExport}
              title="Backup Goals (Export JSON)"
              className="p-2 sm:p-2.5 rounded-2xl text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100/80 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 hover:border-blue-300 dark:hover:border-blue-500/50 shadow-sm transition-all"
              aria-label="Export backup"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Import Button (Opens Import Modal for shared roadmaps or backups) */}
            <button
              onClick={() => setIsImportModalOpen(true)}
              title="Import Shared Roadmap or Backup"
              className="p-2 sm:p-2.5 rounded-2xl text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100/80 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 hover:border-blue-300 dark:hover:border-blue-500/50 shadow-sm transition-all"
              aria-label="Import shared roadmap or backup"
            >
              <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 rounded-2xl text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100/80 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 hover:border-blue-300 dark:hover:border-blue-500/50 shadow-sm transition-all"
              aria-label="Toggle dark mode"
              title={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Edit Name Modal */}
      {isEditingNameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsEditingNameModalOpen(false)}
            className="fixed inset-0 bg-slate-950/60 dark:bg-black/75 backdrop-blur-md"
          />
          <div className="relative w-full max-w-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-slate-200/90 dark:border-slate-700/70 z-10">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Change Your Name
              </h3>
              <button
                onClick={() => setIsEditingNameModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveName} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  What should I call you?
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={30}
                  value={nameInputValue}
                  onChange={(e) => setNameInputValue(e.target.value)}
                  placeholder="Enter name..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingNameModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-xs font-bold shadow-md shadow-blue-500/25 active:scale-95 transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PWA Install Modal */}
      <InstallAppModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        canInstallDirectly={isInstallable}
        onInstallDirectly={triggerInstall}
      />

      {/* Import Modal (Handles Shared Roadmaps & JSON Backups) */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSharedRoadmap={(payload) => {
          if (onImportSharedRoadmap) {
            onImportSharedRoadmap(payload);
          }
        }}
        onRestoreBackupJson={onImport}
      />
    </>
  );
}
