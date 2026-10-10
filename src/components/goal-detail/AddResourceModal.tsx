import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Plus, X, Play, Code, ExternalLink } from 'lucide-react';
import { detectLinkType } from '../../utils/linkDetector';

interface AddResourceModalProps {
  isOpen: boolean;
  dayNumber: number;
  onClose: () => void;
  onAddResource: (url: string, title?: string) => void;
}

export function AddResourceModal({
  isOpen,
  dayNumber,
  onClose,
  onAddResource,
}: AddResourceModalProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const previewDetection = url.trim() ? detectLinkType(url.trim()) : null;

  const handleClose = () => {
    setUrl('');
    setTitle('');
    setError(null);
    setIsSubmitting(false);
    onClose();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmed = url.trim();
    if (!trimmed) {
      setError('Please enter a valid URL');
      return;
    }

    try {
      // Basic validation
      const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
      new URL(withProtocol);

      setIsSubmitting(true);
      onAddResource(withProtocol, title.trim() || undefined);
      
      // Reset form and close modal
      setUrl('');
      setTitle('');
      setError(null);
      setIsSubmitting(false);
      onClose();
    } catch {
      setError('Please provide a valid URL (e.g. leetcode.com or youtube.com)');
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-950/60 dark:bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md spatial-glass bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-spatial-elevated dark:shadow-spatial-elevated-dark border border-slate-200/80 dark:border-slate-800 z-10"
          >
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-sky-400 flex items-center justify-center">
                <Link2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Add Resource Link
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Day {dayNumber} • Smart type auto-detection
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Resource URL
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="e.g. https://youtube.com/... or leetcode.com/..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Live Detection Preview */}
              {previewDetection && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1.5">
                    Live Button Preview:
                  </span>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm pointer-events-none select-none">
                    {previewDetection.type === 'youtube' && (
                      <Play className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    )}
                    {previewDetection.type === 'practice' && (
                      <Code className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
                    )}
                    {previewDetection.type === 'generic' && (
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    )}
                    <span className="text-slate-800 dark:text-slate-200">
                      {previewDetection.label}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Optional Note / Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Tutorial walkthrough, Two Sum problem"
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>

              {error && (
                <p className="text-xs text-rose-500 font-medium">
                  {error}
                </p>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isSubmitting ? 'Adding...' : 'Add Resource'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
