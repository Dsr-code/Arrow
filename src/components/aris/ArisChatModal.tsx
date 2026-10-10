import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Settings,
  X,
  Send,
  Square,
  Trash2,
  Key,
  Sparkles,
  AlertCircle,
  CornerDownLeft,
} from 'lucide-react';
import type { Goal } from '../../types/goal';
import {
  type ArisMessage,
  type ArisSettings,
  PROVIDER_PRESETS,
} from '../../types/aris';
import {
  getArisSettings,
  getArisChatHistory,
  saveArisChatHistory,
  clearArisChatHistory,
  buildLiveAppContext,
  buildSystemPrompt,
  streamChatCompletion,
} from '../../utils/arisClient';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ArisSettingsView } from './ArisSettingsView';

interface ArisChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  goals: Goal[];
  globalStreak: number;
}

export function ArisChatModal({
  isOpen,
  onClose,
  userName = 'Learner',
  goals,
  globalStreak,
}: ArisChatModalProps) {
  const [currentView, setCurrentView] = useState<'chat' | 'settings'>('chat');
  const [settings, setSettings] = useState<ArisSettings>(() => getArisSettings());
  const [messages, setMessages] = useState<ArisMessage[]>(() => getArisChatHistory());
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync settings when opened
  useEffect(() => {
    if (isOpen) {
      setSettings(getArisSettings());
      setErrorMessage(null);
    }
  }, [isOpen]);

  // Save messages whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      saveArisChatHistory(messages);
    }
  }, [messages]);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  // Handle Escape key to close popup
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Check if API key is missing (Ollama is exempt)
  const isKeyMissing =
    PROVIDER_PRESETS[settings.provider]?.keyRequired && !settings.apiKey.trim();

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  const handleClearChat = () => {
    if (isStreaming) {
      handleStopStreaming();
    }
    clearArisChatHistory();
    setMessages([]);
    setErrorMessage(null);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const promptText = (textToSend !== undefined ? textToSend : input).trim();
    if (!promptText || isStreaming) return;

    // Check if key is needed and missing
    if (isKeyMissing) {
      setCurrentView('settings');
      return;
    }

    setErrorMessage(null);
    setInput('');

    // 1. Add user message
    const userMessage: ArisMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: promptText,
      timestamp: Date.now(),
    };

    // 2. Prepare placeholder assistant message
    const assistantMessageId = `assistant-${Date.now()}`;
    const initialAssistantMessage: ArisMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages([...newMessages, initialAssistantMessage]);
    setIsStreaming(true);

    // 3. Build live context from live app data (never saved in history)
    const liveContextJson = buildLiveAppContext(userName, goals, globalStreak);
    const systemPrompt = buildSystemPrompt(liveContextJson);

    // 4. Create AbortController
    const controller = new AbortController();
    abortControllerRef.current = controller;

    let accumulatedResponse = '';

    try {
      await streamChatCompletion({
        settings,
        systemPrompt,
        messages: newMessages, // Only chat history
        signal: controller.signal,
        onToken: (token) => {
          accumulatedResponse += token;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessageId
                ? { ...m, content: accumulatedResponse }
                : m
            )
          );
        },
      });

      // Finalize message
      setMessages((prev) => {
        const updated = prev.map((m) =>
          m.id === assistantMessageId
            ? {
                ...m,
                content:
                  accumulatedResponse.trim() ||
                  "I'm here! How can I help you reach your goals today?",
              }
            : m
        );
        saveArisChatHistory(updated);
        return updated;
      });
    } catch (err: unknown) {
      if (controller.signal.aborted) {
        // User clicked stop
        return;
      }
      const errObj = err as Error;
      const errorText = errObj?.message || 'Something went wrong while connecting to Aris.';
      setErrorMessage(errorText);

      // Update assistant message with error notice if empty
      setMessages((prev) => {
        if (!accumulatedResponse.trim()) {
          const filtered = prev.filter((m) => m.id !== assistantMessageId);
          return [
            ...filtered,
            {
              id: assistantMessageId,
              role: 'assistant',
              content: `⚠️ **Connection Error:** ${errorText}\n\n*Check your API key and Base URL in Aris Settings.*`,
              timestamp: Date.now(),
              isError: true,
            },
          ];
        }
        return prev;
      });
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50 flex items-end sm:items-auto justify-center sm:justify-end pointer-events-none p-2 sm:p-0">
        {/* Mobile Backdrop for full-screen feel on phones */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm sm:hidden pointer-events-auto"
        />

        {/* Floating Spatial UI Popup Card */}
        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 25, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="pointer-events-auto w-full sm:w-[440px] md:w-[460px] h-[85vh] sm:h-[620px] max-h-[88vh] rounded-3xl spatial-glass bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800 shadow-spatial-elevated dark:shadow-spatial-elevated-dark flex flex-col overflow-hidden relative"
          role="dialog"
          aria-label="Aris AI Assistant"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-100 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-sky-400 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
                <Bot className="w-4 h-4" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                    Aris
                  </h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-300 border border-blue-200/50 dark:border-blue-800/50">
                    AI Coach
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">
                  {PROVIDER_PRESETS[settings.provider]?.name || 'AI'} • {settings.model || 'OpenAI API'}
                </p>
              </div>
            </div>

            {/* Header Right Actions: Settings gear & Close X */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  setCurrentView((prev) => (prev === 'chat' ? 'settings' : 'chat'))
                }
                title="Aris Settings (API Key & Provider)"
                className={`p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                  currentView === 'settings'
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400'
                    : ''
                }`}
                aria-label="Toggle Aris settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Close (Esc)"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body: Chat View vs Settings View */}
          {currentView === 'settings' ? (
            <div className="flex-1 overflow-hidden">
              <ArisSettingsView
                settings={settings}
                onSave={(updated) => {
                  setSettings(updated);
                  setErrorMessage(null);
                }}
                onBack={() => setCurrentView('chat')}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Missing API Key Banner */}
              {isKeyMissing && (
                <div className="p-3 mx-4 mt-3 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 flex items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-200 font-medium">
                    <Key className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Add your API key in settings to start chatting</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentView('settings')}
                    className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-sm transition-all shrink-0 active:scale-95"
                  >
                    Settings
                  </button>
                </div>
              )}

              {/* Error banner if top-level error occurred */}
              {errorMessage && !messages.some((m) => m.isError) && (
                <div className="p-3 mx-4 mt-2 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-600 dark:text-rose-300 flex items-start gap-2 shrink-0">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="flex-1 leading-snug">{errorMessage}</span>
                </div>
              )}

              {/* Scrollable Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 min-h-0 text-xs">
                {messages.length === 0 ? (
                  /* Welcoming Empty State */
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center mb-3 shadow-inner">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Hi {userName}! I'm Aris.
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs leading-relaxed">
                      I have live access to your active roadmaps and streaks. Ask me for study recommendations, milestone breakdowns, or motivation!
                    </p>

                    {/* Quick Starter Prompts */}
                    <div className="mt-5 w-full space-y-1.5 text-left">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                        Try asking:
                      </p>
                      {[
                        'What should I focus on today?',
                        'How is my streak and progress going?',
                        'Tips to stay consistent with my goals',
                      ].map((prompt, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleQuickPrompt(prompt)}
                          className="w-full text-left px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/30 border border-slate-200/80 dark:border-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-sky-400 hover:border-blue-300 dark:hover:border-blue-800/60 transition-all"
                        >
                          "{prompt}"
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isUser = m.role === 'user';
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm ${
                            isUser
                              ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-tr-sm'
                              : m.isError
                              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-900/60 rounded-tl-sm'
                              : 'spatial-card bg-slate-100/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60 rounded-tl-sm'
                          }`}
                        >
                          {isUser ? (
                            <p className="whitespace-pre-wrap break-words">{m.content}</p>
                          ) : (
                            <MarkdownRenderer content={m.content} />
                          )}
                        </div>
                        <span className="text-[9px] text-slate-400 mt-1 px-1">
                          {new Date(m.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    );
                  })
                )}

                {/* Streaming Indicator */}
                {isStreaming && (
                  <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-sky-400 font-medium p-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse delay-150" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse delay-300" />
                    <span className="text-[11px] ml-1">Aris is thinking...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Input Area */}
              <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 shrink-0">
                <div className="flex items-center justify-between pb-1.5 px-1 text-[11px] text-slate-400">
                  <span className="text-[10px]">
                    Shift+Enter for new line • Enter to send
                  </span>
                  {messages.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearChat}
                      className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-rose-500 transition-colors"
                      title="Clear chat history"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear chat</span>
                    </button>
                  )}
                </div>

                <div className="flex items-end gap-2 bg-slate-50 dark:bg-slate-800/90 rounded-2xl p-1.5 border border-slate-200 dark:border-slate-700/80 focus-within:border-blue-500/80 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      isKeyMissing
                        ? 'Configure API key in settings to chat...'
                        : 'Ask Aris anything about your goals...'
                    }
                    disabled={isKeyMissing}
                    className="flex-1 bg-transparent px-2.5 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none resize-none max-h-24 min-h-[32px]"
                  />

                  {/* Send or Stop Button */}
                  {isStreaming ? (
                    <button
                      type="button"
                      onClick={handleStopStreaming}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95 shrink-0"
                      title="Stop generating"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Stop</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendMessage()}
                      disabled={!input.trim() || isKeyMissing}
                      className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-sm transition-all active:scale-95 shrink-0"
                      title="Send message (Enter)"
                    >
                      {isKeyMissing ? (
                        <CornerDownLeft className="w-3.5 h-3.5" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
