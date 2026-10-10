import type { Goal } from '../types/goal';
import { calculateGoalStats } from './streak';
import {
  type ArisMessage,
  type ArisSettings,
  DEFAULT_ARIS_SETTINGS,
  PROVIDER_PRESETS,
} from '../types/aris';

const SETTINGS_KEY = 'arrow_aris_settings';
const CHAT_KEY = 'arrow_aris_chat';

export function getArisSettings(): ArisSettings {
  if (typeof window === 'undefined') return DEFAULT_ARIS_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_ARIS_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_ARIS_SETTINGS,
      ...parsed,
    };
  } catch {
    return DEFAULT_ARIS_SETTINGS;
  }
}

export function saveArisSettings(settings: ArisSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save Aris settings:', err);
  }
}

export function getArisChatHistory(): ArisMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveArisChatHistory(messages: ArisMessage[]): void {
  if (typeof window === 'undefined') return;
  try {
    // Keep max 50 recent messages in local storage to prevent bloating
    const trimmed = messages.slice(-50);
    localStorage.setItem(CHAT_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.error('Failed to save Aris chat history:', err);
  }
}

export function clearArisChatHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CHAT_KEY);
  } catch (err) {
    console.error('Failed to clear Aris chat history:', err);
  }
}

/**
 * Builds compact live user context as required:
 * (user name, streak, active goals, progress, completed days, today's topic,
 * and ONLY day -2 to +2 of the roadmap)
 */
export function buildLiveAppContext(
  userName: string,
  goals: Goal[],
  globalStreak: number
): string {
  const compactGoals = (goals || []).map((goal) => {
    const stats = calculateGoalStats(goal);
    const totalDays = goal.days?.length || goal.totalDays || 1;
    const allDays = goal.days || [];

    // All days marked as completed with dayNumber and topic
    const completedDaysList = allDays.filter((d) => d.completed);
    const completedMilestones = completedDaysList.map((d) => ({
      day: d.dayNumber,
      topic: d.topic,
      notes: d.log?.text?.trim() ? d.log.text.trim().slice(0, 80) : undefined,
    }));

    // Find the latest completed day (highest dayNumber)
    const latestCompletedDay =
      completedDaysList.length > 0
        ? completedDaysList.reduce(
            (latest, curr) => (curr.dayNumber > latest.dayNumber ? curr : latest),
            completedDaysList[0]
          )
        : null;

    // First uncompleted day (e.g. if Day 1 was skipped)
    const firstPendingDay = allDays.find((d) => !d.completed);

    // Next upcoming day immediately following latest completed day
    const nextUpcomingDay = latestCompletedDay
      ? allDays.find((d) => d.dayNumber === latestCompletedDay.dayNumber + 1)
      : firstPendingDay;

    // Active focal day for centering the roadmap window (-2 to +2):
    // Center around the latest completed day so the model sees the user's latest work,
    // or around the first pending day if no days have been completed yet.
    const centerDayNum = latestCompletedDay
      ? latestCompletedDay.dayNumber
      : (firstPendingDay?.dayNumber || 1);

    const minDay = Math.max(1, centerDayNum - 2);
    const maxDay = Math.min(totalDays, centerDayNum + 2);

    const roadmapSlice = allDays
      .filter((d) => d.dayNumber >= minDay && d.dayNumber <= maxDay)
      .map((d) => ({
        day: d.dayNumber,
        topic: d.topic,
        completed: d.completed,
        status: d.completed ? 'COMPLETED' : 'PENDING',
        linksCount: d.resources?.length || 0,
        hasNotes: Boolean(d.log?.text?.trim()),
      }));

    // Today's topic: if a day was completed recently, highlight next milestone;
    // otherwise highlight the first pending day.
    let todayTopic = `Day 1`;
    if (latestCompletedDay) {
      todayTopic =
        nextUpcomingDay && !nextUpcomingDay.completed
          ? `Day ${nextUpcomingDay.dayNumber}: ${nextUpcomingDay.topic} (Next to do; Day ${latestCompletedDay.dayNumber} "${latestCompletedDay.topic}" is completed)`
          : `Day ${latestCompletedDay.dayNumber}: ${latestCompletedDay.topic} (Completed)`;
    } else if (firstPendingDay) {
      todayTopic = `Day ${firstPendingDay.dayNumber}: ${firstPendingDay.topic} (Pending)`;
    }

    return {
      name: goal.name,
      category: goal.category || undefined,
      progress: `${stats.completedDays}/${totalDays} (${stats.percentage}%)`,
      totalDays,
      completedDaysCount: stats.completedDays,
      pendingDaysCount: totalDays - stats.completedDays,
      completedDays: completedMilestones,
      latestCompletedMilestone: latestCompletedDay
        ? { day: latestCompletedDay.dayNumber, topic: latestCompletedDay.topic }
        : null,
      nextUpcomingMilestone: nextUpcomingDay
        ? {
            day: nextUpcomingDay.dayNumber,
            topic: nextUpcomingDay.topic,
            status: nextUpcomingDay.completed ? 'COMPLETED' : 'PENDING',
          }
        : null,
      firstPendingMilestone: firstPendingDay
        ? { day: firstPendingDay.dayNumber, topic: firstPendingDay.topic }
        : null,
      todayTopic,
      streak: stats.streak,
      roadmapWindow: roadmapSlice,
    };
  });

  const payload = {
    userName,
    globalStreak,
    activeGoalsCount: compactGoals.length,
    goals: compactGoals,
  };

  return JSON.stringify(payload);
}

export function buildSystemPrompt(liveContextJson: string): string {
  return `You are Arrow Assistant, a friendly goal/study coach. Use the user's live data below. Be concise. Reply in the same language the user writes in (Hindi/Hinglish/English).
Always check the 'completedDays' list in USER DATA to accurately report which milestones the user has finished, and 'pending'/'next' for what is upcoming. Prioritize current USER DATA over previous chat history. Never claim an uncompleted day is completed.
USER DATA: ${liveContextJson}`;
}

export interface StreamChatOptions {
  settings: ArisSettings;
  systemPrompt: string;
  messages: ArisMessage[];
  signal?: AbortSignal;
  onToken: (token: string) => void;
}

/**
 * Sends request to OpenAI-compatible /chat/completions endpoint with streaming.
 */
export async function streamChatCompletion({
  settings,
  systemPrompt,
  messages,
  signal,
  onToken,
}: StreamChatOptions): Promise<void> {
  const preset = PROVIDER_PRESETS[settings.provider];
  const baseUrl = (settings.baseUrl || preset?.baseUrl || '').trim().replace(/\/+$/, '');
  const model = (settings.model || preset?.defaultModel || '').trim();

  if (!baseUrl) {
    throw new Error('Please configure a valid Base URL in Aris settings.');
  }

  if (!model) {
    throw new Error('Please enter a model name in Aris settings.');
  }

  // Ollama doesn't require a key, other providers do
  if (preset?.keyRequired && !settings.apiKey.trim()) {
    throw new Error(`API key required for ${preset.name}. Please add it in Aris settings.`);
  }

  const endpoint = `${baseUrl}/chat/completions`;

  // History: send only the last 10 messages from chat history
  const historySlice = messages.slice(-10).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const payloadMessages = [
    { role: 'system', content: systemPrompt },
    ...historySlice,
  ];

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (settings.apiKey.trim()) {
    headers['Authorization'] = `Bearer ${settings.apiKey.trim()}`;
  }

  // Helpful headers for OpenRouter
  if (settings.provider === 'openrouter') {
    headers['HTTP-Referer'] = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
    headers['X-Title'] = 'Arrow Goal Tracker';
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: payloadMessages,
        stream: true,
        temperature: 0.7,
      }),
      signal,
    });
  } catch (err: unknown) {
    if (signal?.aborted) {
      throw err;
    }

    const errorObj = err as Error;
    // Check if network / CORS error
    if (settings.provider === 'ollama') {
      throw new Error(
        'Unable to connect to Ollama. Make sure Ollama is running and CORS is enabled: OLLAMA_ORIGINS="*" ollama serve'
      );
    }
    throw new Error(
      `Network connection error: ${errorObj.message || 'Failed to reach API endpoint. Please check your internet or Base URL.'}`
    );
  }

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errJson = await response.json();
      errorDetail =
        errJson?.error?.message ||
        errJson?.message ||
        JSON.stringify(errJson);
    } catch {
      // response might not be JSON
    }

    if (response.status === 401) {
      throw new Error(
        `Authentication Failed (401): Invalid API key for ${preset?.name || 'provider'}. Please verify your key in Settings.`
      );
    }
    if (response.status === 429) {
      throw new Error(
        `Rate limit exceeded (429): ${errorDetail || 'Too many requests. Please wait a moment or try another model.'}`
      );
    }
    if (response.status === 404) {
      throw new Error(
        `Model or Endpoint Not Found (404): Model "${model}" was not found at ${baseUrl}. ${errorDetail}`
      );
    }

    throw new Error(
      `API Error (${response.status}): ${errorDetail || response.statusText || 'Unknown error occurred.'}`
    );
  }

  if (!response.body) {
    throw new Error('Response body is empty. Streaming is not supported by this server.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  try {
    while (true) {
      if (signal?.aborted) {
        break;
      }

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith(':')) continue;

        if (trimmedLine.startsWith('data: ')) {
          const dataStr = trimmedLine.slice(6).trim();
          if (dataStr === '[DONE]') {
            return;
          }

          try {
            const parsed = JSON.parse(dataStr);
            const deltaContent = parsed.choices?.[0]?.delta?.content;
            if (deltaContent) {
              onToken(deltaContent);
            }
          } catch {
            // Partial or malformed SSE line, keep parsing remaining
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
