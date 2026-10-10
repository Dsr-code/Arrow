import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Trash2,
  Edit2,
  Check,
  X,
  Clock,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import type { Goal } from '../../types/goal';
import { calculateGoalStats } from '../../utils/streak';

interface GoalHeaderProps {
  goal: Goal;
  filter: 'all' | 'pending' | 'completed' | 'notes';
  onFilterChange: (filter: 'all' | 'pending' | 'completed' | 'notes') => void;
  onBack: () => void;
  onUpdateGoalName: (newName: string) => void;
  onDeleteRequest: () => void;
  onShareRequest?: () => void;
}

export function GoalHeader({
  goal,
  filter,
  onFilterChange,
  onBack,
  onUpdateGoalName,
  onDeleteRequest,
  onShareRequest,
}: GoalHeaderProps) {
  const stats = calculateGoalStats(goal);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(goal.name);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setNameInput(goal.name);
  }, [goal.name]);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  const commitNameChange = () => {
    setIsEditingName(false);
    const trimmed = nameInput.trim();
    if (trimmed && trimmed !== goal.name) {
      onUpdateGoalName(trimmed);
    } else {
      setNameInput(goal.name);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitNameChange();
    } else if (e.key === 'Escape') {
      setIsEditingName(false);
      setNameInput(goal.name);
    }
  };

  return (
    <div className="mb-8 p-6 sm:p-8 rounded-3xl spatial-card bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-spatial dark:shadow-spatial-dark">
      {/* Top row: Back button, Category, Delete action */}
      <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-4 mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200/50 dark:border-slate-700/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Goals</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Remaining Days Badge */}
          <div
            title={goal.endDate ? `Target End Date: ${goal.endDate}` : undefined}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-blue-700 dark:text-sky-300 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 shadow-sm"
          >
            <Clock className="w-3.5 h-3.5 text-blue-500 dark:text-sky-400" />
            <span>{Math.max(0, stats.totalDays - stats.completedDays)} {Math.max(0, stats.totalDays - stats.completedDays) === 1 ? 'Day' : 'Days'} Remaining</span>
          </div>

          {onShareRequest && (
            <button
              onClick={onShareRequest}
              title="Share roadmap"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold text-blue-700 dark:text-sky-300 bg-blue-50/60 dark:bg-blue-950/30 hover:bg-blue-100/80 dark:hover:bg-blue-900/50 border border-blue-200/80 dark:border-blue-800/60 shadow-sm transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
              <span className="hidden sm:inline">Share</span>
            </button>
          )}

          <button
            onClick={onDeleteRequest}
            title="Delete goal"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete Goal</span>
          </button>
        </div>
      </div>

      {/* Middle row: Editable Goal Name & Streak Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          {isEditingName ? (
            <div className="flex items-center gap-2 max-w-lg">
              <input
                ref={nameInputRef}
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={commitNameChange}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-1.5 text-xl sm:text-3xl font-extrabold rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-blue-500 text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={commitNameChange}
                className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                title="Save"
              >
                <Check className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setIsEditingName(false);
                  setNameInput(goal.name);
                }}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => setIsEditingName(true)}
              className="group/title inline-flex items-center gap-2 sm:gap-3 cursor-pointer select-none max-w-full"
              title="Click to edit goal name"
            >
              <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight break-words">
                {goal.name}
              </h1>
              <div className="p-1.5 rounded-lg text-slate-400 opacity-60 sm:opacity-0 group-hover/title:opacity-100 hover:text-blue-600 dark:hover:text-sky-400 transition-opacity shrink-0">
                <Edit2 className="w-4 h-4" />
              </div>
            </div>
          )}

          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Created on {new Date(goal.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
            {goal.startDate && goal.endDate && (
              <span> • {goal.startDate} to {goal.endDate}</span>
            )}
          </p>
        </div>

        {/* Streak Counter Badge */}
        {stats.streak > 0 && (
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-sm font-black shadow-sm self-start sm:self-center">
            <span>🔥 {stats.streak}</span>
          </div>
        )}
      </div>

      {/* Progress Bar & Stats */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
          <span className="text-slate-700 dark:text-slate-300">
            Roadmap Progress
          </span>
          <span className="text-blue-600 dark:text-sky-400 font-extrabold">
            {stats.completedDays} of {stats.totalDays} Days Completed ({stats.percentage}%)
          </span>
        </div>

        {/* Wide Linear Progress Bar */}
        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800/90 overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-750">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stats.percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              stats.isCompleted
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : 'bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400'
            }`}
          />
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {(
            [
              { key: 'all', label: `All (${goal.days?.length || 0})` },
              {
                key: 'pending',
                label: `Pending (${(goal.days?.length || 0) - stats.completedDays})`,
              },
              {
                key: 'completed',
                label: `Completed (${stats.completedDays})`,
              },
              {
                key: 'notes',
                label: `With Notes (${goal.days?.filter((d) => d.log?.text).length || 0})`,
              },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              onClick={() => onFilterChange(item.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === item.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/80'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {stats.isCompleted && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Goal Achieved! Outstanding work.</span>
          </div>
        )}
      </div>
    </div>
  );
}
