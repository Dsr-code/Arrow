import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Plus,
  BookOpen,
  Edit2,
  FileText,
  Clock,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import type { Day } from '../../types/goal';
import { ResourcePill } from './ResourcePill';
import { AddResourceModal } from './AddResourceModal';
import { ManageResourcesModal } from './ManageResourcesModal';
import { DayLogEditor } from './DayLogEditor';

interface DayCardProps {
  day: Day;
  isLast?: boolean;
  onToggleComplete: () => void;
  onUpdateTopic: (newTopic: string) => void;
  onAddResource: (url: string, title?: string) => void;
  onUpdateResource?: (resourceId: string, url: string, title?: string) => void;
  onRemoveResource: (resourceId: string) => void;
  onSaveLog: (text: string) => void;
  onDeleteLog: () => void;
  onDeleteDay?: () => void;
}

export function DayCard({
  day,
  isLast = false,
  onToggleComplete,
  onUpdateTopic,
  onAddResource,
  onUpdateResource,
  onRemoveResource,
  onSaveLog,
  onDeleteLog,
  onDeleteDay,
}: DayCardProps) {
  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [topicInput, setTopicInput] = useState(day.topic);
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [isManageResourcesOpen, setIsManageResourcesOpen] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const topicInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTopicInput(day.topic);
  }, [day.topic]);

  useEffect(() => {
    if (isEditingTopic && topicInputRef.current) {
      topicInputRef.current.focus();
      topicInputRef.current.select();
    }
  }, [isEditingTopic]);

  const commitTopicChange = () => {
    setIsEditingTopic(false);
    const trimmed = topicInput.trim();
    const finalTopic = trimmed || `Day ${day.dayNumber}: Milestone & Objective`;
    if (finalTopic !== day.topic) {
      onUpdateTopic(finalTopic);
    }
    setTopicInput(finalTopic);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitTopicChange();
    } else if (e.key === 'Escape') {
      setIsEditingTopic(false);
      setTopicInput(day.topic);
    }
  };

  const hasLog = Boolean(day.log && day.log.text.trim().length > 0);

  return (
    <>
      <div className="relative flex items-start gap-3 sm:gap-5 group">
        {/* Timeline Indicator Column */}
        <div className="flex flex-col items-center shrink-0 self-stretch pt-2">
          {/* Completion Toggle Button */}
          <button
            onClick={onToggleComplete}
            title={day.completed ? 'Mark day as pending' : 'Mark day as complete'}
            className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-2xl flex items-center justify-center transition-all duration-200 z-10 ${
              day.completed
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105'
                : 'bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 text-transparent hover:border-blue-500 dark:hover:border-sky-400 shadow-sm'
            }`}
            aria-label={`Toggle completion for Day ${day.dayNumber}`}
          >
            <AnimatePresence mode="wait">
              {day.completed && (
                <motion.div
                  key="check"
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 350 }}
                >
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Vertical connecting timeline line */}
          {!isLast && (
            <div
              className={`w-0.5 flex-1 mt-2 transition-colors duration-200 ${
                day.completed
                  ? 'bg-emerald-300/60 dark:bg-emerald-800/60'
                  : 'bg-slate-200 dark:bg-slate-800'
              }`}
            />
          )}
        </div>

        {/* Day Content Card */}
        <div
          className={`flex-1 mb-6 p-4 sm:p-5 rounded-3xl border transition-all duration-200 spatial-card ${
            day.completed
              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-800/40 shadow-sm'
              : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/80 dark:border-slate-800/80 shadow-spatial dark:shadow-spatial-dark'
          }`}
        >
          {/* Card Top Header: Day Badge, Editable Topic, Completion status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-xl shrink-0 transition-colors ${
                  day.completed
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                    : 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-sky-300 border border-blue-200/60 dark:border-blue-800/40'
                }`}
              >
                Day {day.dayNumber}
              </span>

              {/* Editable Topic Name */}
              <div className="flex-1 min-w-0">
                {isEditingTopic ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      ref={topicInputRef}
                      type="text"
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                      onBlur={commitTopicChange}
                      onKeyDown={handleKeyDown}
                      className="w-full px-2.5 py-1 text-sm sm:text-base font-bold rounded-lg bg-slate-50 dark:bg-slate-800 border border-blue-500 dark:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white"
                      placeholder="Topic name..."
                    />
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onTouchStart={(e) => e.preventDefault()}
                      onClick={commitTopicChange}
                      className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                      title="Save Topic"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onTouchStart={(e) => e.preventDefault()}
                      onClick={() => {
                        setIsEditingTopic(false);
                        setTopicInput(day.topic);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => setIsEditingTopic(true)}
                    className="group/topic flex items-center gap-2 cursor-pointer select-none"
                    title="Click to rename topic"
                  >
                    <h4
                      className={`text-sm sm:text-base font-bold transition-colors leading-snug ${
                        day.completed
                          ? 'line-through text-slate-500 dark:text-slate-400'
                          : 'text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-sky-400'
                      }`}
                    >
                      {day.topic}
                    </h4>
                    <Edit2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 opacity-60 group-hover/topic:opacity-100 transition-opacity shrink-0" />
                  </div>
                )}
              </div>
            </div>

            {/* Right actions: Done indicator & Delete Day button */}
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              {day.completed && day.completedAt && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Done
                </span>
              )}

              {onDeleteDay && (
                <button
                  type="button"
                  onClick={onDeleteDay}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors opacity-60 hover:opacity-100"
                  title={`Delete Day ${day.dayNumber}`}
                  aria-label={`Delete Day ${day.dayNumber}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Resources section */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {day.resources && day.resources.length > 0 ? (
              day.resources.map((res) => (
                <ResourcePill
                  key={res.id}
                  resource={res}
                />
              ))
            ) : null}

            {/* Add Resource Button */}
            <button
              onClick={() => setIsAddResourceOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-blue-700 dark:text-sky-300 bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-dashed border-blue-300 dark:border-blue-700/60 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Resource</span>
            </button>

            {/* Edit Resources Button (beside Add Resource, to prevent accidental deletion) */}
            {day.resources && day.resources.length > 0 && (
              <button
                onClick={() => setIsManageResourcesOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/60 transition-colors"
                title="Manage, edit or remove resources safely"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Edit Resources</span>
              </button>
            )}
          </div>

          {/* Bottom Card Actions: Log Indicator / Create Log Button */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
            {hasLog ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsLogOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-sky-300 border border-blue-200/60 dark:border-blue-800/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-500 dark:text-sky-400" />
                  <span>Log Notes</span>
                  <span className="text-[10px] px-1 rounded-md bg-blue-200/60 dark:bg-blue-900 text-blue-800 dark:text-sky-200">
                    {isLogOpen ? 'Hide' : 'View'}
                  </span>
                </button>
                {day.log?.updatedAt && (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
                    Updated {new Date(day.log.updatedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsLogOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-sky-400 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>+ Create Log</span>
              </button>
            )}

            {/* Quick Completion Checkbox on mobile/tablet */}
            <button
              onClick={onToggleComplete}
              className={`text-xs font-semibold px-3 py-1 rounded-xl transition-all sm:hidden ${
                day.completed
                  ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/50'
                  : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
              }`}
            >
              {day.completed ? 'Completed' : 'Mark Done'}
            </button>
          </div>

          {/* Expandable Log Notes Editor */}
          <DayLogEditor
            log={day.log}
            isOpen={isLogOpen}
            onSave={(text) => onSaveLog(text)}
            onDelete={() => {
              onDeleteLog();
              setIsLogOpen(false);
            }}
            onClose={() => setIsLogOpen(false)}
          />
        </div>
      </div>

      {/* Add Resource Modal */}
      <AddResourceModal
        isOpen={isAddResourceOpen}
        dayNumber={day.dayNumber}
        onClose={() => setIsAddResourceOpen(false)}
        onAddResource={onAddResource}
      />

      {/* Manage / Edit Resources Modal */}
      <ManageResourcesModal
        isOpen={isManageResourcesOpen}
        dayNumber={day.dayNumber}
        resources={day.resources || []}
        onClose={() => setIsManageResourcesOpen(false)}
        onUpdateResource={(resId, url, title) => {
          if (onUpdateResource) {
            onUpdateResource(resId, url, title);
          }
        }}
        onRemoveResource={onRemoveResource}
        onAddResource={onAddResource}
      />
    </>
  );
}
