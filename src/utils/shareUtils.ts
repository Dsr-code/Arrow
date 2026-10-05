import LZString from 'lz-string';
import type { Goal, Day, ResourceType } from '../types/goal';

export interface SharedRoadmapPayload {
  v: 1;
  name: string;
  totalDays: number;
  category?: string;
  days: {
    dayNumber: number;
    topic: string;
    resources: {
      url: string;
      type: ResourceType;
      title?: string;
    }[];
  }[];
}

/**
 * Encodes only the roadmap structure (name, days, topics, resources).
 * Strictly excludes user's completion status, timestamps, and personal logs.
 * Guarantees that ALL days from 1 to totalDays are fully populated with topics and resources.
 */
export function encodeRoadmap(goal: Goal): string {
  const rawDays = goal.days || [];
  const totalDays = Math.max(1, Math.max(goal.totalDays || 0, rawDays.length));

  // Build a map of existing days by dayNumber
  const daysMap = new Map<number, Day>();
  rawDays.forEach((d) => {
    daysMap.set(d.dayNumber, d);
  });

  // Ensure every single day up to totalDays is explicitly encoded with a title and its resources
  const completeDays: SharedRoadmapPayload['days'] = [];
  for (let i = 1; i <= totalDays; i++) {
    const existing = daysMap.get(i);
    const topic = existing?.topic?.trim() || `Day ${i}: Milestone & Objective`;
    const resources = (existing?.resources || []).map((r) => ({
      url: r.url,
      type: r.type,
      title: r.title?.trim() || undefined,
    }));

    completeDays.push({
      dayNumber: i,
      topic,
      resources,
    });
  }

  const payload: SharedRoadmapPayload = {
    v: 1,
    name: goal.name.trim() || 'Untitled Roadmap',
    totalDays: totalDays,
    category: goal.category?.trim() || undefined,
    days: completeDays,
  };

  const json = JSON.stringify(payload);
  return LZString.compressToEncodedURIComponent(json);
}

/**
 * Decodes a share code or full share URL back into a SharedRoadmapPayload.
 * Ensures every day up to totalDays is populated with labels/topics.
 */
export function decodeRoadmap(rawInput: string): SharedRoadmapPayload | null {
  if (!rawInput || typeof rawInput !== 'string') return null;

  let code = rawInput.trim();

  // If a full URL or hash was pasted, extract the data param
  if (code.includes('data=')) {
    try {
      const parts = code.split('data=');
      if (parts[1]) {
        code = decodeURIComponent(parts[1].split('&')[0]);
      }
    } catch {
      // continue with raw
    }
  }

  // 1. Try LZString decompression (with space-to-plus fallback for URL safety)
  let decompressed: string | null = null;
  try {
    decompressed = LZString.decompressFromEncodedURIComponent(code);
    if (!decompressed && code.includes(' ')) {
      decompressed = LZString.decompressFromEncodedURIComponent(code.replace(/ /g, '+'));
    }
  } catch {
    decompressed = null;
  }

  // 2. Fallback: if user pasted uncompressed JSON directly
  if (!decompressed && (code.startsWith('{') || code.startsWith('['))) {
    decompressed = code;
  }

  if (!decompressed) return null;

  try {
    const parsed = JSON.parse(decompressed);
    if (!parsed || typeof parsed !== 'object') return null;

    // Validate essential properties
    const name = typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name.trim() : 'Shared Roadmap';
    const rawDays = Array.isArray(parsed.days) ? parsed.days : [];
    const totalDays = Math.max(1, Math.min(365, Math.max(Number(parsed.totalDays) || 0, rawDays.length)));

    // Index existing days by dayNumber
    const daysMap = new Map<number, any>();
    rawDays.forEach((d: any, idx: number) => {
      const num = Number(d.dayNumber) || idx + 1;
      daysMap.set(num, d);
    });

    // Populate every day from 1 to totalDays so no day is ever missing or unlabeled
    const completeDays: SharedRoadmapPayload['days'] = [];
    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
      const existing = daysMap.get(dayNum);
      const topic = existing?.topic?.trim() || `Day ${dayNum}: Milestone & Objective`;
      const rawResources = Array.isArray(existing?.resources) ? existing.resources : [];
      const resources = rawResources
        .map((r: any) => ({
          url: String(r.url || ''),
          type: (r.type === 'youtube' || r.type === 'practice' ? r.type : 'generic') as ResourceType,
          title: r.title ? String(r.title).trim() : undefined,
        }))
        .filter((r: any) => r.url.length > 0);

      completeDays.push({
        dayNumber: dayNum,
        topic,
        resources,
      });
    }

    return {
      v: 1,
      name,
      totalDays,
      category: parsed.category ? String(parsed.category).trim() : undefined,
      days: completeDays,
    };
  } catch (err) {
    console.warn('Failed to parse decoded roadmap JSON:', err);
    return null;
  }
}

/**
 * Generates the full share URL
 */
export function generateShareUrl(code: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  return `${origin}${pathname}#/share?data=${code}`;
}

/**
 * Converts a SharedRoadmapPayload into a fresh Goal ready to be added to user's storage.
 * Guarantees that all days from 1 to totalDays exist, have titles/topics, and clean 0% progress.
 */
export function createGoalFromSharedPayload(payload: SharedRoadmapPayload): Goal {
  const totalDays = Math.max(1, Math.max(payload.totalDays, payload.days.length));

  const daysMap = new Map<number, SharedRoadmapPayload['days'][0]>();
  payload.days.forEach((d) => {
    daysMap.set(d.dayNumber, d);
  });

  const newDays: Day[] = [];
  for (let i = 1; i <= totalDays; i++) {
    const existing = daysMap.get(i);
    const topic = existing?.topic?.trim() || `Day ${i}: Milestone & Objective`;
    const resources: Day['resources'] = (existing?.resources || []).map((r) => ({
      id: `res-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
      url: r.url,
      type: r.type,
      title: r.title,
    }));

    newDays.push({
      dayNumber: i,
      topic,
      resources,
      completed: false,
    });
  }

  return {
    id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: payload.name.trim() || 'Imported Roadmap',
    totalDays: totalDays,
    createdAt: new Date().toISOString(),
    days: newDays,
    category: payload.category,
  };
}
