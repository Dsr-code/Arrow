import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowLeft, Calendar, Layers, ShieldCheck, Sparkles, BookOpen } from 'lucide-react';
import type { SharedRoadmapPayload } from '../../utils/shareUtils';
import { ResourcePill } from '../goal-detail/ResourcePill';

interface SharePreviewScreenProps {
  payload: SharedRoadmapPayload;
  onAddToMyGoals: (payload: SharedRoadmapPayload) => void;
  onCancel: () => void;
}

export function SharePreviewScreen({
  payload,
  onAddToMyGoals,
  onCancel,
}: SharePreviewScreenProps) {
  const totalResources = useMemo(() => {
    return payload.days.reduce(
      (acc, d) => acc + (d.resources ? d.resources.length : 0),
      0
    );
  }, [payload]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Top Banner & Navigation */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/50 dark:border-slate-700/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/50 text-blue-700 dark:text-sky-300 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-blue-500 dark:text-sky-400" />
          <span>Shared Roadmap Preview</span>
        </span>
      </div>

      {/* Roadmap Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 sm:p-8 rounded-3xl spatial-card bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-spatial dark:shadow-spatial-dark mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex-1 min-w-0">
            {payload.category && (
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-sky-300 mb-2 border border-blue-200/60 dark:border-blue-800/40">
                {payload.category}
              </span>
            )}
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {payload.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl">
              Someone shared this structured roadmap with you. Add it to your Arrow dashboard to track daily progress and build your streak.
            </p>

            {/* Metrics pills */}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700/50">
                <Calendar className="w-4 h-4 text-blue-500 dark:text-sky-400" />
                {payload.totalDays} Days Roadmap
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700/50">
                <Layers className="w-4 h-4 text-blue-500 dark:text-sky-400" />
                {totalResources} Curated Link{totalResources === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="flex flex-col sm:items-end gap-2.5 shrink-0">
            <button
              onClick={() => onAddToMyGoals(payload)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-sm shadow-lg shadow-blue-500/25 active:scale-95 transition-all w-full sm:w-auto"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>Add to My Goals</span>
            </button>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center sm:text-right">
              Fresh 0% progress start for you
            </p>
          </div>
        </div>

        {/* Privacy Note Banner */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>
            <strong>Fresh & Independent:</strong> Only the curriculum topics and resources are imported. Your progress, checkboxes, and reflection logs will be strictly your own.
          </span>
        </div>
      </motion.div>

      {/* Days Roadmap List Preview */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-sky-400" />
            Milestones Preview ({payload.days.length} Days)
          </h2>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Review before adding
          </span>
        </div>

        <div className="space-y-3">
          {payload.days.map((day) => (
            <div
              key={day.dayNumber}
              className="p-4 sm:p-5 rounded-3xl spatial-card bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-all"
            >
              <div className="flex items-start gap-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-sky-300 border border-blue-200/50 dark:border-blue-800/40 shrink-0">
                  Day {day.dayNumber}
                </span>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {day.topic}
                  </h4>

                  {/* Resources */}
                  {day.resources && day.resources.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                      {day.resources.map((res, i) => (
                        <ResourcePill
                          key={i}
                          resource={{
                            id: `preview-${i}`,
                            url: res.url,
                            type: res.type,
                            title: res.title,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-6 z-20 p-4 rounded-3xl spatial-glass bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 shadow-spatial-elevated dark:shadow-spatial-elevated-dark flex items-center justify-between gap-4">
        <div className="hidden sm:block text-xs font-medium text-slate-500 dark:text-slate-400">
          Ready to achieve <strong>"{payload.name}"</strong>?
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onAddToMyGoals(payload)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add to My Goals</span>
          </button>
        </div>
      </div>
    </div>
  );
}
