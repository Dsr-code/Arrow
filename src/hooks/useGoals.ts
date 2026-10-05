import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Goal, Day, Resource, DayLog } from '../types/goal';
import { detectLinkType } from '../utils/linkDetector';
import { fireConfetti } from '../utils/soundEffects';
import { type SharedRoadmapPayload, createGoalFromSharedPayload } from '../utils/shareUtils';

const STORAGE_KEY = 'arrow_goals_v1';

/**
 * Deduplicates resources within a day to prevent duplicate links/tabs
 */
function sanitizeGoals(rawGoals: Goal[]): Goal[] {
  if (!Array.isArray(rawGoals)) return [];
  return rawGoals.map((g) => ({
    ...g,
    days: (g.days || []).map((day) => {
      if (!day.resources || day.resources.length <= 1) return day;
      const seen = new Set<string>();
      const uniqueResources: Resource[] = [];
      for (const r of day.resources) {
        const norm = (r.url || '').toLowerCase().trim().replace(/\/$/, '');
        if (!seen.has(norm)) {
          seen.add(norm);
          uniqueResources.push(r);
        }
      }
      return { ...day, resources: uniqueResources };
    }),
  }));
}

export function useGoals() {
  const [goals, setGoals] = useLocalStorage<Goal[]>(STORAGE_KEY, () => {
    return [];
  });

  // Ensure goals always have deduplicated resources and no sample goal
  const cleanGoals = useMemo(() => {
    const sanitized = sanitizeGoals(goals);
    return sanitized.filter((g) => g.id !== 'goal-learn-python-sample');
  }, [goals]);

  // Get a single goal by ID
  const getGoalById = useCallback(
    (id: string): Goal | undefined => {
      return cleanGoals.find((g) => g.id === id);
    },
    [cleanGoals]
  );

  // 1. Create a new goal with auto-generated days
  const createGoal = useCallback(
    (
      name: string,
      totalDays: number,
      startDate?: string,
      endDate?: string,
      category?: string
    ): Goal => {
      const trimmedName = name.trim();
      const sanitizedDays = Math.max(1, Math.min(365, Math.floor(totalDays)));

      const generatedDays: Day[] = Array.from({ length: sanitizedDays }, (_, i) => ({
        dayNumber: i + 1,
        topic: `Day ${i + 1}: Milestone & Objective`,
        resources: [],
        completed: false,
      }));

      const newGoal: Goal = {
        id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: trimmedName,
        totalDays: sanitizedDays,
        createdAt: new Date().toISOString(),
        days: generatedDays,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        category: category?.trim() || undefined,
      };

      setGoals((prev) => [newGoal, ...prev]);
      return newGoal;
    },
    [setGoals]
  );

  // 1b. Import Shared Roadmap
  const importSharedRoadmap = useCallback(
    (payload: SharedRoadmapPayload): Goal => {
      const newGoal = createGoalFromSharedPayload(payload);
      setGoals((prev) => [newGoal, ...prev]);
      return newGoal;
    },
    [setGoals]
  );

  // 1c. Add a new day to an existing goal
  const addDayToGoal = useCallback(
    (goalId: string, customTopic?: string): Day | undefined => {
      let createdDay: Day | undefined;

      setGoals((prev) =>
        prev.map((goal) => {
          if (goal.id !== goalId) return goal;

          const currentDays = goal.days || [];
          const nextDayNum = currentDays.length + 1;
          createdDay = {
            dayNumber: nextDayNum,
            topic: customTopic?.trim() || `Day ${nextDayNum}: Milestone & Objective`,
            resources: [],
            completed: false,
          };

          return {
            ...goal,
            totalDays: Math.max(goal.totalDays, nextDayNum),
            days: [...currentDays, createdDay],
          };
        })
      );

      return createdDay;
    },
    [setGoals]
  );

  // 1d. Delete a day from an existing goal (re-indexing remaining days)
  const deleteDayFromGoal = useCallback(
    (goalId: string, dayNumber: number): boolean => {
      let wasDeleted = false;

      setGoals((prev) =>
        prev.map((goal) => {
          if (goal.id !== goalId) return goal;

          const currentDays = goal.days || [];
          if (currentDays.length <= 1) {
            return goal;
          }

          const filtered = currentDays.filter((d) => d.dayNumber !== dayNumber);
          if (filtered.length === currentDays.length) {
            return goal;
          }

          wasDeleted = true;
          // Re-number remaining days cleanly from 1 to length
          const renumberedDays: Day[] = filtered.map((d, index) => ({
            ...d,
            dayNumber: index + 1,
          }));

          return {
            ...goal,
            totalDays: renumberedDays.length,
            days: renumberedDays,
          };
        })
      );

      return wasDeleted;
    },
    [setGoals]
  );

  // 2. Update Goal Name
  const updateGoalName = useCallback(
    (goalId: string, newName: string) => {
      const trimmed = newName.trim();
      if (!trimmed) return;

      setGoals((prev) =>
        prev.map((goal) => {
          if (goal.id === goalId) {
            return { ...goal, name: trimmed };
          }
          return goal;
        })
      );
    },
    [setGoals]
  );

  // 3. Delete Goal
  const deleteGoal = useCallback(
    (goalId: string) => {
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
    },
    [setGoals]
  );

  // 4. Toggle Day Completion
  const toggleDayCompletion = useCallback(
    (goalId: string, dayNumber: number) => {
      let isNewlyCompleted = false;
      let allDaysCompletedNow = false;

      setGoals((prev) =>
        prev.map((goal) => {
          if (goal.id !== goalId) return goal;

          const updatedDays = goal.days.map((day) => {
            if (day.dayNumber === dayNumber) {
              const nextCompleted = !day.completed;
              if (nextCompleted) {
                isNewlyCompleted = true;
              }
              return {
                ...day,
                completed: nextCompleted,
                completedAt: nextCompleted ? new Date().toISOString() : undefined,
              };
            }
            return day;
          });

          const completedCount = updatedDays.filter((d) => d.completed).length;
          if (isNewlyCompleted && completedCount === updatedDays.length) {
            allDaysCompletedNow = true;
          }

          return { ...goal, days: updatedDays };
        })
      );

      if (isNewlyCompleted) {
        fireConfetti(allDaysCompletedNow);
      }
    },
    [setGoals]
  );

  // 5. Update Day Topic (inline editing)
  const updateDayTopic = useCallback(
    (goalId: string, dayNumber: number, topic: string) => {
      setGoals((prev) =>
        prev.map((goal) => {
          if (goal.id !== goalId) return goal;

          const updatedDays = goal.days.map((day) => {
            if (day.dayNumber === dayNumber) {
              return { ...day, topic: topic.trim() || `Day ${dayNumber}` };
            }
            return day;
          });

          return { ...goal, days: updatedDays };
        })
      );
    },
    [setGoals]
  );

  // 6. Add Resource to Day (Strictly deduplicated)
  const addDayResource = useCallback(
    (goalId: string, dayNumber: number, rawUrl: string, customTitle?: string) => {
      const detection = detectLinkType(rawUrl);
      const normalizedKey = detection.normalizedUrl.toLowerCase().trim().replace(/\/$/, '');
      const newResourceId = `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newResource: Resource = {
        id: newResourceId,
        url: detection.normalizedUrl,
        type: detection.type,
        title: customTitle?.trim() || undefined,
      };

      setGoals((prev) =>
        prev.map((goal) => {
          if (goal.id !== goalId) return goal;

          const updatedDays = goal.days.map((day) => {
            if (day.dayNumber === dayNumber) {
              const currentResources = day.resources || [];
              // Prevent adding duplicate resource by id or normalized URL
              const alreadyExists = currentResources.some(
                (r) =>
                  r.id === newResource.id ||
                  (r.url || '').toLowerCase().trim().replace(/\/$/, '') === normalizedKey
              );
              if (alreadyExists) {
                return day;
              }
              return {
                ...day,
                resources: [...currentResources, newResource],
              };
            }
            return day;
          });

          return { ...goal, days: updatedDays };
        })
      );

      return newResource;
    },
    [setGoals]
  );

  // 7. Remove Resource from Day
  const removeDayResource = useCallback(
    (goalId: string, dayNumber: number, resourceId: string) => {
      setGoals((prev) =>
        prev.map((goal) => {
          if (goal.id !== goalId) return goal;

          const updatedDays = goal.days.map((day) => {
            if (day.dayNumber === dayNumber) {
              return {
                ...day,
                resources: (day.resources || []).filter((r) => r.id !== resourceId),
              };
            }
            return day;
          });

          return { ...goal, days: updatedDays };
        })
      );
    },
    [setGoals]
  );

  // 7b. Update Day Resource
  const updateDayResource = useCallback(
    (
      goalId: string,
      dayNumber: number,
      resourceId: string,
      newUrl: string,
      newTitle?: string
    ) => {
      const detection = detectLinkType(newUrl);
      setGoals((prev) =>
        prev.map((goal) => {
          if (goal.id !== goalId) return goal;

          const updatedDays = goal.days.map((day) => {
            if (day.dayNumber === dayNumber) {
              const updated = (day.resources || []).map((r) => {
                if (r.id === resourceId) {
                  return {
                    ...r,
                    url: detection.normalizedUrl,
                    type: detection.type,
                    title: newTitle?.trim() || undefined,
                  };
                }
                return r;
              });
              return { ...day, resources: updated };
            }
            return day;
          });

          return { ...goal, days: updatedDays };
        })
      );
    },
    [setGoals]
  );

  // 8. Save Day Log (create or update)
  const saveDayLog = useCallback(
    (goalId: string, dayNumber: number, text: string) => {
      const logData: DayLog = {
        text: text.trim(),
        updatedAt: new Date().toISOString(),
      };

      setGoals((prev) =>
        prev.map((goal) => {
          if (goal.id !== goalId) return goal;

          const updatedDays = goal.days.map((day) => {
            if (day.dayNumber === dayNumber) {
              return { ...day, log: logData };
            }
            return day;
          });

          return { ...goal, days: updatedDays };
        })
      );
    },
    [setGoals]
  );

  // 9. Delete Day Log
  const deleteDayLog = useCallback(
    (goalId: string, dayNumber: number) => {
      setGoals((prev) =>
        prev.map((goal) => {
          if (goal.id !== goalId) return goal;

          const updatedDays = goal.days.map((day) => {
            if (day.dayNumber === dayNumber) {
              const updated = { ...day };
              delete updated.log;
              return updated;
            }
            return day;
          });

          return { ...goal, days: updatedDays };
        })
      );
    },
    [setGoals]
  );

  // Export Goals as JSON
  const exportGoals = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cleanGoals, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `arrow-goals-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [cleanGoals]);

  // Import Goals JSON
  const importGoals = useCallback(
    (jsonString: string): boolean => {
      try {
        const parsed = JSON.parse(jsonString);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id && parsed[0].days) {
          setGoals(sanitizeGoals(parsed));
          return true;
        }
      } catch (err) {
        console.warn('Failed to parse imported goals:', err);
      }
      return false;
    },
    [setGoals]
  );

  return {
    goals: cleanGoals,
    getGoalById,
    createGoal,
    updateGoalName,
    deleteGoal,
    toggleDayCompletion,
    updateDayTopic,
    addDayResource,
    updateDayResource,
    removeDayResource,
    saveDayLog,
    deleteDayLog,
    exportGoals,
    importGoals,
    importSharedRoadmap,
    addDayToGoal,
    deleteDayFromGoal,
  };
}
