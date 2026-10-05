import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Code2, FileJson, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { decodeRoadmap, type SharedRoadmapPayload } from '../../utils/shareUtils';
import { useToast } from '../../context/ToastContext';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSharedRoadmap: (payload: SharedRoadmapPayload) => void;
  onRestoreBackupJson: (json: string) => boolean;
}

export function ImportModal({
  isOpen,
  onClose,
  onImportSharedRoadmap,
  onRestoreBackupJson,
}: ImportModalProps) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'share' | 'backup'>('share');

  // Shared code / link input state
  const [shareInput, setShareInput] = useState('');
  const [decodedPreview, setDecodedPreview] = useState<SharedRoadmapPayload | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);

  // Backup file state
  const [backupError, setBackupError] = useState<string | null>(null);

  const handleShareInputChange = (val: string) => {
    setShareInput(val);
    setShareError(null);
    if (!val.trim()) {
      setDecodedPreview(null);
      return;
    }

    const decoded = decodeRoadmap(val.trim());
    if (decoded) {
      setDecodedPreview(decoded);
      setShareError(null);
    } else {
      setDecodedPreview(null);
      if (val.trim().length > 10) {
        setShareError('Invalid share link or code. Please check and try again.');
      }
    }
  };

  const handleImportShared = () => {
    if (!decodedPreview) {
      const decoded = decodeRoadmap(shareInput.trim());
      if (decoded) {
        onImportSharedRoadmap(decoded);
        toast.success('Roadmap Imported! 🎯', `"${decoded.name}" has been added to your goals.`);
        onClose();
      } else {
        setShareError('Please enter a valid share link or roadmap code.');
      }
      return;
    }

    onImportSharedRoadmap(decodedPreview);
    toast.success('Roadmap Imported! 🎯', `"${decodedPreview.name}" has been added to your goals.`);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBackupError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = onRestoreBackupJson(content);
        if (success) {
          toast.success('Backup Restored! 🎉', 'Your goals and history were restored.');
          onClose();
        } else {
          setBackupError('Invalid backup file. Please provide a valid Arrow JSON export.');
        }
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 dark:bg-black/75 backdrop-blur-sm"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-lg bg-white dark:bg-[#0a0314] rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/80 dark:border-purple-900/40 z-10 max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-purple-300 rounded-full hover:bg-slate-100 dark:hover:bg-purple-950/50"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/25 shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Import into Arrow
              </h3>
              <p className="text-xs text-slate-500 dark:text-purple-300/70">
                Paste a shared roadmap link or restore your full backup
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex rounded-2xl bg-slate-100 dark:bg-[#140726] p-1 mb-5">
            <button
              type="button"
              onClick={() => setActiveTab('share')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'share'
                  ? 'bg-white dark:bg-[#0a0314] text-purple-700 dark:text-purple-300 shadow-sm'
                  : 'text-slate-600 dark:text-purple-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Paste Shared Roadmap</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('backup')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'backup'
                  ? 'bg-white dark:bg-[#0a0314] text-purple-700 dark:text-purple-300 shadow-sm'
                  : 'text-slate-600 dark:text-purple-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileJson className="w-4 h-4" />
              <span>Restore Backup File</span>
            </button>
          </div>

          {/* Tab 1: Paste Shared Roadmap */}
          {activeTab === 'share' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-purple-200 mb-1.5">
                  Shared Link or Code
                </label>
                <textarea
                  rows={3}
                  value={shareInput}
                  onChange={(e) => handleShareInputChange(e.target.value)}
                  placeholder="Paste https://...#/share?data=... or raw code here..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#140726] border border-slate-200 dark:border-purple-800/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-purple-400/40 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>

              {/* Decoded Roadmap Live Preview */}
              {decodedPreview && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-700 dark:text-purple-300">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Ready to Import:</span>
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                        {decodedPreview.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-purple-300/70 mt-1">
                        {decodedPreview.totalDays} Days • {decodedPreview.days.reduce((a, d) => a + d.resources.length, 0)} Resource links
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleImportShared}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/25 active:scale-95 transition-all"
                    >
                      <span>Add to Goals</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Error feedback */}
              {shareError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{shareError}</span>
                </div>
              )}

              <p className="text-[11px] text-slate-400 dark:text-purple-400/60">
                Imported roadmaps start completely fresh with 0% progress and no shared logs.
              </p>
            </div>
          )}

          {/* Tab 2: Restore JSON Backup */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-purple-900/50 flex flex-col items-center justify-center text-center">
                <FileJson className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
                <p className="text-xs font-semibold text-slate-700 dark:text-purple-200 mb-1">
                  Upload an Arrow JSON Backup File
                </p>
                <p className="text-[11px] text-slate-400 dark:text-purple-400/60 mb-4 max-w-xs">
                  Restores all your past goals, streak milestones, and saved notes.
                </p>

                <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer shadow-md shadow-purple-500/25 active:scale-95 transition-all">
                  <Upload className="w-4 h-4" />
                  <span>Choose JSON File</span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {backupError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{backupError}</span>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-purple-900/30 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-purple-300 hover:bg-slate-100 dark:hover:bg-purple-950/40"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
