import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Goal } from '../types/goal';
import { GoalCard } from '../components/dashboard/GoalCard';
import { GoalStatsBar } from '../components/dashboard/GoalStatsBar';
import { EmptyState } from '../components/dashboard/EmptyState';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { calculateGlobalStats } from '../utils/streak';
import { Plus, Search, Sparkles } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface DashboardPageProps {
  goals: Goal[];
  userName?: string;
  onSelectGoal: (goalId: string) => void;
  onOpenCreateModal: () => void;
  onDeleteGoal: (goalId: string) => void;
  onShareGoal?: (goal: Goal) => void;
}

export function DashboardPage({
  goals,
  userName,
  onSelectGoal,
  onOpenCreateModal,
  onDeleteGoal,
  onShareGoal,
}: DashboardPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);
  const toast = useToast();

  const globalStats = calculateGlobalStats(goals);

  const filteredGoals = goals.filter((g) => {
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = g.name.toLowerCase().includes(q);
      const matchCategory = g.category?.toLowerCase().includes(q) || false;
      if (!matchName && !matchCategory) return false;
    }

    // Status filter
    const completedDays = g.days?.filter((d) => d.completed).length || 0;
    const isFinished = (g.days?.length || g.totalDays) === completedDays;
    if (filter === 'active') return !isFinished;
    if (filter === 'completed') return isFinished;
    return true;
  });

  const confirmDelete = () => {
    if (goalToDelete) {
      onDeleteGoal(goalToDelete.id);
      toast.info('Goal Deleted', `"${goalToDelete.name}" was removed.`);
      setGoalToDelete(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Welcome Headline with User Name */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-[#140726] text-brand-700 dark:text-purple-300 text-xs font-semibold mb-2.5 border border-brand-200/60 dark:border-purple-800/60">
            <Sparkles className="w-3.5 h-3.5 text-brand-500 dark:text-purple-400" />
            <span>Progress Driven Focus</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {userName ? `Welcome back, ${userName} 👋` : 'Your Goal Roadmaps'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-purple-300/70 mt-1 max-w-lg leading-relaxed">
            Break any big milestone into daily steps with curated resources and reflections.
          </p>
        </div>
      </div>

      {/* Global Overview Metrics */}
      {goals.length > 0 && <GoalStatsBar stats={globalStats} />}

      {/* Controls Bar: Search & Filter Tabs */}
      {goals.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          {/* Search bar */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search goals..."
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#0a0314] border border-slate-200/80 dark:border-purple-900/40 text-xs sm:text-sm text-slate-800 dark:text-purple-100 placeholder-slate-400 dark:placeholder-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all shadow-soft"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(
              [
                { key: 'all', label: `All (${goals.length})` },
                {
                  key: 'active',
                  label: `Active (${globalStats.activeGoalsCount})`,
                },
                {
                  key: 'completed',
                  label: `Completed (${globalStats.completedGoalsCount})`,
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  filter === tab.key
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white dark:bg-[#0a0314] text-slate-600 dark:text-purple-300 border border-slate-200/70 dark:border-purple-900/40 hover:bg-slate-50 dark:hover:bg-[#140726]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Goals Grid or Empty State */}
      {goals.length === 0 ? (
        <EmptyState onCreateGoal={onOpenCreateModal} />
      ) : filteredGoals.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-3xl bg-white dark:bg-[#0a0314] border border-slate-200/80 dark:border-purple-900/40">
          <p className="text-sm font-semibold text-slate-600 dark:text-purple-300">
            No goals match your search or filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilter('all');
            }}
            className="mt-3 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <AnimatePresence mode="popLayout">
            {filteredGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onSelect={onSelectGoal}
                onDeleteRequest={(g) => setGoalToDelete(g)}
                onShareRequest={onShareGoal}
              />
            ))}
          </AnimatePresence>

          {/* Quick "+ Add Another Goal" Card placeholder */}
          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            onClick={onOpenCreateModal}
            className="p-6 rounded-3xl border-2 border-dashed border-slate-200 dark:border-purple-900/40 hover:border-purple-500/50 dark:hover:border-purple-500/50 bg-slate-50/50 dark:bg-[#0a0314]/40 flex flex-col items-center justify-center text-center cursor-pointer min-h-[200px] sm:min-h-[220px] group transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-[#140726] text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm">
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h4 className="text-base font-bold text-slate-800 dark:text-purple-100 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
              Set New Goal
            </h4>
            <p className="text-xs text-slate-400 dark:text-purple-400/60 mt-1 max-w-[200px]">
              Generate a custom 7, 30, or 60-day roadmap
            </p>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {goalToDelete && (
        <ConfirmModal
          isOpen={Boolean(goalToDelete)}
          title="Delete this Goal?"
          message={`Are you sure you want to delete "${goalToDelete.name}"? All days and study logs will be removed.`}
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onClose={() => setGoalToDelete(null)}
        />
      )}
    </div>
  );
}
