import { motion, AnimatePresence } from 'framer-motion';
import { Download, Monitor, Smartphone, Check, X, Laptop, Globe } from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  canInstallDirectly: boolean;
  onInstallDirectly: () => void;
}

export function InstallAppModal({
  isOpen,
  onClose,
  canInstallDirectly,
  onInstallDirectly,
}: InstallAppModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 dark:bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-lg spatial-glass bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-spatial-elevated dark:shadow-spatial-elevated-dark border border-slate-200/80 dark:border-slate-800 z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-sky-400 flex items-center justify-center text-white shadow-md">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Use Arrow as a Desktop App
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Runs in its own window with zero distractions & offline support
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Direct 1-Click Install Button if supported */}
            {canInstallDirectly && (
              <div className="mt-5 p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-blue-900 dark:text-sky-200">
                    Instant 1-Click Install
                  </p>
                  <p className="text-xs text-blue-700/80 dark:text-sky-300/80 mt-0.5">
                    Your browser supports direct installation
                  </p>
                </div>
                <button
                  onClick={() => {
                    onInstallDirectly();
                    onClose();
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/25 transition-all shrink-0 active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  Install Now
                </button>
              </div>
            )}

            {/* Platform Instructions */}
            <div className="mt-5 space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                How to install on your browser:
              </h4>

              {/* Chrome / Edge / Brave */}
              <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                <Laptop className="w-5 h-5 text-blue-500 dark:text-sky-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Chrome, Edge & Brave (Desktop)
                  </p>
                  <p>
                    Look for the <span className="font-medium text-blue-600 dark:text-sky-400">Install icon (⊕ or computer)</span> on the right side of your address bar, or click Menu (<span className="font-mono">⋮</span>) → <span className="font-medium">"Install Arrow..."</span> or <span className="font-medium">"Apps" → "Install this site as an app"</span>.
                  </p>
                </div>
              </div>

              {/* Safari / macOS */}
              <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                <Globe className="w-5 h-5 text-blue-500 dark:text-sky-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Safari (macOS Sonoma+)
                  </p>
                  <p>
                    Click <span className="font-medium">File</span> in the menu bar → <span className="font-medium">"Add to Dock..."</span> to launch Arrow as an independent Mac app.
                  </p>
                </div>
              </div>

              {/* Mobile */}
              <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-blue-500 dark:text-sky-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    iOS Safari & Android
                  </p>
                  <p>
                    Tap <span className="font-medium">Share</span> (<span className="font-mono">↑</span>) → <span className="font-medium">"Add to Home Screen"</span> for full-screen native experience.
                  </p>
                </div>
              </div>
            </div>

            {/* Features check */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                Offline ready
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                Standalone window
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                Fast localStorage sync
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
