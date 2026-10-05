import { Target, Plus } from 'lucide-react';

interface EmptyStateProps {
  onCreateGoal: () => void;
}

export function EmptyState({ onCreateGoal }: EmptyStateProps) {
  return (
    <div className="text-center py-12 sm:py-16 px-4 sm:px-6 max-w-md mx-auto">
      <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
        <div className="absolute inset-0 rounded-3xl bg-brand-500/10 dark:bg-purple-600/20 animate-pulse" />
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/25">
          <Target className="w-8 h-8" />
        </div>
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
        No Goals Set Yet
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed max-w-sm mx-auto">
        Turn big ambitions into structured daily milestones. Set your target duration, map each day's study or practice, and build momentum.
      </p>

      <div className="flex items-center justify-center">
        <button
          onClick={onCreateGoal}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 hover:from-brand-500 hover:to-violet-500 text-white font-bold text-sm shadow-md shadow-brand-500/25 hover:shadow-lg active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Create Your First Goal</span>
        </button>
      </div>
    </div>
  );
}
