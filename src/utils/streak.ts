import type { Goal } from '../types/goal';

export interface GoalStats {
  totalDays: number;
  completedDays: number;
  percentage: number;
  streak: number;
  nextPendingDayNumber?: number;
  isCompleted: boolean;
}

/**
 * Calculates current streak for a goal.
 * Finds consecutive completed days from Day 1 or current unbroken streak.
 */
export function calculateGoalStreak(goal: Goal): number {
  if (!goal.days || goal.days.length === 0) return 0;

  let currentStreak = 0;
  // Sequential streak from Day 1
  for (const day of goal.days) {
    if (day.completed) {
      currentStreak++;
    } else {
      break;
    }
  }

  return currentStreak;
}

/**
 * Computes comprehensive statistics for a goal
 */
export function calculateGoalStats(goal: Goal): GoalStats {
  const totalDays = goal.days?.length || goal.totalDays || 0;
  const completedDays = goal.days?.filter((d) => d.completed).length || 0;
  const percentage = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
  const streak = calculateGoalStreak(goal);
  const nextPendingDay = goal.days?.find((d) => !d.completed);
  const isCompleted = totalDays > 0 && completedDays === totalDays;

  return {
    totalDays,
    completedDays,
    percentage,
    streak,
    nextPendingDayNumber: nextPendingDay ? nextPendingDay.dayNumber : undefined,
    isCompleted,
  };
}

export interface GlobalStats {
  totalGoals: number;
  completedGoalsCount: number;
  activeGoalsCount: number;
  totalCompletedDays: number;
  totalDays: number;
  overallPercentage: number;
  highestStreak: number;
}

/**
 * Computes global statistics across all goals
 */
export function calculateGlobalStats(goals: Goal[]): GlobalStats {
  const totalGoals = goals.length;
  let totalCompletedDays = 0;
  let totalDays = 0;
  let highestStreak = 0;
  let completedGoalsCount = 0;

  for (const goal of goals) {
    const stats = calculateGoalStats(goal);
    totalCompletedDays += stats.completedDays;
    totalDays += stats.totalDays;
    if (stats.streak > highestStreak) {
      highestStreak = stats.streak;
    }
    if (stats.isCompleted) {
      completedGoalsCount++;
    }
  }

  const overallPercentage =
    totalDays > 0 ? Math.round((totalCompletedDays / totalDays) * 100) : 0;

  return {
    totalGoals,
    completedGoalsCount,
    activeGoalsCount: totalGoals - completedGoalsCount,
    totalCompletedDays,
    totalDays,
    overallPercentage,
    highestStreak,
  };
}
