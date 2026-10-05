import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Trash2, X, Plus, Play, Code, ExternalLink, Check } from 'lucide-react';
import type { Resource } from '../../types/goal';
import { detectLinkType } from '../../utils/linkDetector';

interface ManageResourcesModalProps {
  isOpen: boolean;
  dayNumber: number;
  resources: Resource[];
  onClose: () => void;
  onUpdateResource: (resourceId: string, url: string, title?: string) => void;
  onRemoveResource: (resourceId: string) => void;
  onAddResource: (url: string, title?: string) => void;
}

export function ManageResourcesModal({
  isOpen,
  dayNumber,
  resources,
  onClose,
  onUpdateResource,
  onRemoveResource,
  onAddResource,
}: ManageResourcesModalProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState('');
  const [editTitle, setEditTitle] = useState('');

  // New resource inline state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  const startEdit = (res: Resource) => {
    setEditingId(res.id);
    setEditUrl(res.url);
    setEditTitle(res.title || '');
    setError(null);
  };

  const saveEdit = (resId: string) => {
    if (!editUrl.trim()) return;
    try {
      const withProtocol = /^https?:\/\//i.test(editUrl.trim()) ? editUrl.trim() : `https://${editUrl.trim()}`;
      new URL(withProtocol);
      onUpdateResource(resId, withProtocol, editTitle.trim() || undefined);
      setEditingId(null);
    } catch {
      setError('Please provide a valid URL');
    }
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    try {
      const withProtocol = /^https?:\/\//i.test(newUrl.trim()) ? newUrl.trim() : `https://${newUrl.trim()}`;
      new URL(withProtocol);
      onAddResource(withProtocol, newTitle.trim() || undefined);
      setNewUrl('');
      setNewTitle('');
      setShowAddForm(false);
      setError(null);
    } catch {
      setError('Please enter a valid URL');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'youtube':
        return <Play className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />;
      case 'practice':
        return <Code className="w-3.5 h-3.5 text-indigo-500 dark:text-purple-400 shrink-0" />;
      default:
        return <ExternalLink className="w-3.5 h-3.5 text-slate-500 dark:text-purple-300 shrink-0" />;
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
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 dark:bg-black/75 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-lg bg-white dark:bg-[#0a0314] rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/80 dark:border-purple-900/40 z-10 max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-purple-900/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Edit Day {dayNumber} Resources
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-purple-300/70">
                    Modify links, titles, or safely delete items
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-purple-300 rounded-full hover:bg-slate-100 dark:hover:bg-purple-950/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mt-3 text-xs text-rose-500 font-medium p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
                {error}
              </div>
            )}

            {/* Resources List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {resources.length === 0 ? (
                <div className="text-center py-8 text-slate-400 dark:text-purple-300/60 text-sm">
                  No resources added to Day {dayNumber} yet.
                </div>
              ) : (
                resources.map((res) => {
                  const isEditing = editingId === res.id;
                  const detected = detectLinkType(res.url);

                  return (
                    <div
                      key={res.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#140726] border border-slate-200/80 dark:border-purple-800/40 transition-colors"
                    >
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editUrl}
                            onChange={(e) => setEditUrl(e.target.value)}
                            placeholder="Resource URL..."
                            className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#0a0314] border border-slate-200 dark:border-purple-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Optional title / note..."
                            className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#0a0314] border border-slate-200 dark:border-purple-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 dark:text-purple-300"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => saveEdit(res.id)}
                              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="p-1.5 rounded-lg bg-white dark:bg-[#0a0314] shadow-sm shrink-0">
                              {getIcon(res.type)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-800 dark:text-purple-100 truncate">
                                {res.title || detected.label}
                              </p>
                              <p className="text-[11px] text-slate-400 dark:text-purple-300/50 truncate">
                                {res.url}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => startEdit(res)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg text-slate-600 dark:text-purple-300 hover:bg-slate-200/60 dark:hover:bg-purple-900/40 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => onRemoveResource(res.id)}
                              title="Delete this resource"
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* Add form toggle */}
              {showAddForm ? (
                <form
                  onSubmit={handleAddNew}
                  className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/40 space-y-2 mt-2"
                >
                  <p className="text-xs font-bold text-purple-900 dark:text-purple-200">
                    Add New Link
                  </p>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="URL (youtube.com, leetcode.com, etc.)..."
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#0a0314] border border-slate-200 dark:border-purple-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Optional title..."
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#0a0314] border border-slate-200 dark:border-purple-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 dark:text-purple-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Link
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="w-full py-2.5 rounded-2xl border border-dashed border-slate-300 dark:border-purple-800/60 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another Resource Link</span>
                </button>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-purple-900/30 flex items-center justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all active:scale-95"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
