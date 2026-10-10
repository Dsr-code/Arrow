import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Copy, Check, X, ShieldCheck, Share, Code2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import type { Goal } from '../../types/goal';
import { encodeRoadmap, generateShareUrl } from '../../utils/shareUtils';
import { useToast } from '../../context/ToastContext';

interface ShareModalProps {
  isOpen: boolean;
  goal: Goal | null;
  onClose: () => void;
}

export function ShareModal({ isOpen, goal, onClose }: ShareModalProps) {
  const toast = useToast();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showDayPreview, setShowDayPreview] = useState(false);

  const { shareCode, shareUrl, totalResources } = useMemo(() => {
    if (!goal) return { shareCode: '', shareUrl: '', totalResources: 0 };
    const code = encodeRoadmap(goal);
    const url = generateShareUrl(code);
    const resourcesCount = (goal.days || []).reduce(
      (acc, d) => acc + (d.resources ? d.resources.length : 0),
      0
    );
    return { shareCode: code, shareUrl: url, totalResources: resourcesCount };
  }, [goal]);

  const canNativeShare = typeof navigator !== 'undefined' && Boolean(navigator.share);

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      toast.success('Share Link Copied! 📋', 'Send this link to anyone using Arrow to import this roadmap.');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      toast.error('Failed to copy', 'Please select and copy the link manually.');
    }
  };

  const handleCopyCode = async () => {
    if (!shareCode) return;
    try {
      await navigator.clipboard.writeText(shareCode);
      setCopiedCode(true);
      toast.success('Share Code Copied! 📋', 'Code copied! Anyone can paste this into the Import button.');
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      toast.error('Failed to copy', 'Please select and copy the code manually.');
    }
  };

  const handleNativeShare = async () => {
    if (!goal || !navigator.share) return;
    try {
      await navigator.share({
        title: `Arrow Roadmap: ${goal.name}`,
        text: `Check out the "${goal.name}" ${goal.totalDays}-day roadmap on Arrow!`,
        url: shareUrl,
      });
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        toast.info('Share cancelled or unavailable');
      }
    }
  };

  if (!isOpen || !goal) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 dark:bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-lg spatial-glass bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-spatial-elevated dark:shadow-spatial-elevated-dark border border-slate-200/80 dark:border-slate-800 z-10 max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close share modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-sky-400 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
                  Share Roadmap
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-sky-300 font-semibold">
                  Zero Server • Instant
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white truncate max-w-sm">
                {goal.name}
              </h3>
            </div>
          </div>

          {/* Privacy Note Banner */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200/80 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-300 mb-5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong>Private & Fresh:</strong> Only the roadmap (topics and resources) is shared. Your progress, checklist, and notes stay 100% private. Recipients start with a clean slate!
            </div>
          </div>

          {/* Roadmap Info Summary & Inspection */}
          <div className="mb-5 pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500 dark:text-sky-400" />
                  {goal.totalDays} Days Roadmap
                </span>
                <span>•</span>
                <span>{totalResources} Resource Link{totalResources === 1 ? '' : 's'}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowDayPreview((prev) => !prev)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-sky-400 hover:underline"
              >
                <span>{showDayPreview ? 'Hide Preview' : 'Inspect Milestones'}</span>
                {showDayPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Collapsible Inspection Box */}
            <AnimatePresence>
              {showDayPreview && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mt-2.5"
                >
                  <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-700/60 text-xs">
                    {(goal.days || []).map((d) => (
                      <div
                        key={d.dayNumber}
                        className="flex items-center justify-between gap-2 py-1.5 px-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-bold text-[11px] text-blue-600 dark:text-sky-400 shrink-0">
                            Day {d.dayNumber}:
                          </span>
                          <span className="truncate font-medium">{d.topic}</span>
                        </div>
                        <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-sky-300">
                          {d.resources?.length || 0} link{d.resources?.length === 1 ? '' : 's'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 px-1">
                    Custom topics and resource links you set for each day are included in the link.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section 1: Generated Share Link */}
          <div className="space-y-2 mb-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Share Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="flex-1 px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-mono truncate focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs shadow-md shadow-blue-500/25 transition-all shrink-0"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-400">
              When opened, Arrow shows a full preview with an "Add to my goals" button.
            </p>
          </div>

          {/* Section 2: Share Code Payload (for manual pasting) */}
          <div className="space-y-2 mb-5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Share Code
              </label>
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-sky-400 hover:underline"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Code2 className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
            <div
              onClick={handleCopyCode}
              title="Click to copy code"
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-750 text-[11px] font-mono text-slate-600 dark:text-slate-300 break-all line-clamp-2 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
            >
              {shareCode}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-400">
              If the link cannot be opened, paste this code into Arrow's <strong>Import</strong> button.
            </p>
          </div>

          {/* Section 3: Native Share (Mobile) */}
          {canNativeShare && (
            <div className="pt-2 mb-2">
              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-100/90 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700 font-semibold text-xs transition-all active:scale-98"
              >
                <Share className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                <span>Share via Apps (WhatsApp, Messages, AirDrop)</span>
              </button>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
