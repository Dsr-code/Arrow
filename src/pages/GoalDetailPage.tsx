import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Goal } from '../types/goal';
import { GoalHeader } from '../components/goal-detail/GoalHeader';
import { DayCard } from '../components/goal-detail/DayCard';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useToast } from '../context/ToastContext';
import { Search, Plus, Trash2 } from 'lucide-react';

interface GoalDetailPageProps {
  goal: Goal;
  onBack: () => void;
  onUpdateGoalName: (newName: string) => void;
  onDeleteGoal: (goalId: string) => void;
  onToggleDayCompletion: (dayNumber: number) => void;
  onUpdateDayTopic: (dayNumber: number, topic: string) => void;
  onAddResource: (dayNumber: number, url: string, title?: string) => void;
  onUpdateResource?: (dayNumber: number, resourceId: string, url: string, title?: string) => void;
  onRemoveResource: (dayNumber: number, resourceId: string) => void;
  onSaveDayLog: (dayNumber: number, text: string) => void;
  onDeleteDayLog: (dayNumber: number) => void;
  onShareGoal?: (goal: Goal) => void;
  onAddDay?: () => void;
  onDeleteDay?: (dayNumber: number) => void;
}

export function GoalDetailPage({
  goal,
  onBack,
  onUpdateGoalName,
  onDeleteGoal,
  onToggleDayCompletion,
  onUpdateDayTopic,
  onAddResource,
  onUpdateResource,
  onRemoveResource,
  onSaveDayLog,
  onDeleteDayLog,
  onShareGoal,
  onAddDay,
  onDeleteDay,
}: GoalDetailPageProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'notes'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteGoalModalOpen, setIsDeleteGoalModalOpen] = useState(false);
  const [dayToDelete, setDayToDelete] = useState<number | null>(null);
  const toast = useToast();

  const handleRequestDeleteDay = (dayNum: number) => {
    if ((goal.days?.length || 0) <= 1) {
      toast.info('Cannot Remove Day', 'A goal roadmap must have at least 1 milestone day.');
      return;
    }
    const target = goal.days?.find((d) => d.dayNumber === dayNum);
    const isDefaultTopic =
      !target?.topic ||
      target.topic === `Day ${dayNum}: Milestone & Objective` ||
      target.topic === `Day ${dayNum}`;
    const hasResources = Boolean(target?.resources && target.resources.length > 0);
    const hasLog = Boolean(target?.log && target.log.text.trim().length > 0);

    // If completely empty, uncompleted, without notes/links, delete immediately
    if (isDefaultTopic && !hasResources && !hasLog && !target?.completed) {
      if (onDeleteDay) {
        onDeleteDay(dayNum);
        toast.info('Day Removed', `Day ${dayNum} was removed.`);
      }
    } else {
      setDayToDelete(dayNum);
    }
  };

  const filteredDays = (goal.days || []).filter((day) => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTopic = day.topic.toLowerCase().includes(q);
      const matchDay = `day ${day.dayNumber}`.includes(q);
      const matchLog = day.log?.text.toLowerCase().includes(q) || false;
      if (!matchTopic && !matchDay && !matchLog) return false;
    }

    // Status filter
    if (filter === 'pending') return !day.completed;
    if (filter === 'completed') return day.completed;
    if (filter === 'notes') return Boolean(day.log && day.log.text.trim().length > 0);
    return true;
  });

  const handleDeleteGoalConfirm = () => {
    onDeleteGoal(goal.id);
    toast.info('Goal Deleted', `"${goal.name}" was removed.`);
    onBack();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header section */}
      <GoalHeader
        goal={goal}
        filter={filter}
        onFilterChange={setFilter}
        onBack={onBack}
        onUpdateGoalName={(newName) => {
          onUpdateGoalName(newName);
          toast.success('Goal Renamed', `Updated to "${newName}"`);
        }}
        onDeleteRequest={() => setIsDeleteGoalModalOpen(true)}
        onShareRequest={onShareGoal ? () => onShareGoal(goal) : undefined}
      />

      {/* Quick Search & Count Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topic or notes..."
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-all shadow-sm"
          />
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 self-end sm:self-center font-medium">
          Showing {filteredDays.length} of {goal.days?.length || 0} days
        </div>
      </div>

      {/* Timeline Day Cards List */}
      <div className="space-y-1">
        <AnimatePresence mode="popLayout">
          {filteredDays.length > 0 ? (
            filteredDays.map((day, index) => (
              <div key={day.dayNumber}>
                <DayCard
                  day={day}
                  isLast={index === filteredDays.length - 1}
                  onToggleComplete={() => {
                    const wasCompleted = day.completed;
                    onToggleDayCompletion(day.dayNumber);
                    if (!wasCompleted) {
                      toast.success(
                        `Day ${day.dayNumber} Completed! 🎉`,
                        `Marked "${day.topic}" as done.`
                      );
                    }
                  }}
                  onUpdateTopic={(newTopic) => {
                    onUpdateDayTopic(day.dayNumber, newTopic);
                    toast.info('Topic Updated', `Day ${day.dayNumber} topic updated.`);
                  }}
                  onAddResource={(url, title) => {
                    onAddResource(day.dayNumber, url, title);
                    toast.success('Resource Added', `Added link to Day ${day.dayNumber}.`);
                  }}
                  onUpdateResource={(resId, url, title) => {
                    if (onUpdateResource) {
                      onUpdateResource(day.dayNumber, resId, url, title);
                      toast.success('Resource Updated');
                    }
                  }}
                  onRemoveResource={(resId) => {
                    onRemoveResource(day.dayNumber, resId);
                    toast.info('Resource Removed');
                  }}
                  onSaveLog={(text) => {
                    onSaveDayLog(day.dayNumber, text);
                  }}
                  onDeleteLog={() => {
                    onDeleteDayLog(day.dayNumber);
                    toast.info('Log Deleted', `Cleared notes for Day ${day.dayNumber}.`);
                  }}
                  onDeleteDay={onDeleteDay ? () => handleRequestDeleteDay(day.dayNumber) : undefined}
                />
              </div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-8 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800"
            >
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                No milestone days match your current filter.
              </p>
              <button
                onClick={() => {
                  setFilter('all');
                  setSearchQuery('');
                }}
                className="mt-3 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Reset filters & search
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add / Delete Day buttons for expanding / shrinking roadmap length */}
      {filter === 'all' && !searchQuery.trim() && (
        <div className="pt-2 pb-6 flex flex-wrap items-center justify-center gap-3">
          {onAddDay && (
            <button
              onClick={onAddDay}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white dark:bg-[#0a0314] hover:bg-purple-50 dark:hover:bg-[#140726] border border-dashed border-slate-300 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Day {(goal.days?.length || 0) + 1}</span>
            </button>
          )}

          {onDeleteDay && (goal.days?.length || 0) > 1 && (
            <button
              onClick={() => handleRequestDeleteDay(goal.days.length)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#0a0314] hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-purple-800/40 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 text-xs sm:text-sm font-semibold shadow-sm transition-all active:scale-95"
              title="Delete the last day if created by chance"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Last Day</span>
            </button>
          )}
        </div>
      )}

      {/* Delete Day Confirmation Modal */}
      <ConfirmModal
        isOpen={dayToDelete !== null}
        title={`Delete Day ${dayToDelete}?`}
        message={`Are you sure you want to delete Day ${dayToDelete}${
          dayToDelete && goal.days?.find((d) => d.dayNumber === dayToDelete)?.topic
            ? ` ("${goal.days.find((d) => d.dayNumber === dayToDelete)?.topic}")`
            : ''
        }? Any attached links or notes for this day will be removed, and remaining days will be renumbered.`}
        confirmLabel="Delete Day"
        onConfirm={() => {
          if (dayToDelete !== null && onDeleteDay) {
            onDeleteDay(dayToDelete);
            toast.info('Day Removed', `Day ${dayToDelete} was removed.`);
            setDayToDelete(null);
          }
        }}
        onClose={() => setDayToDelete(null)}
      />

      {/* Delete Goal Modal */}
      <ConfirmModal
        isOpen={isDeleteGoalModalOpen}
        title="Delete this Goal?"
        message={`Are you sure you want to permanently delete "${goal.name}" and all of its ${goal.totalDays} days of progress, links, and logs? This cannot be undone.`}
        confirmLabel="Delete Goal"
        onConfirm={handleDeleteGoalConfirm}
        onClose={() => setIsDeleteGoalModalOpen(false)}
      />
    </div>
  );
}
