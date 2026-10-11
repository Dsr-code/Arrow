import { useState, useEffect } from 'react';
import { useGoals } from './hooks/useGoals';
import { ToastProvider, useToast } from './context/ToastContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { DashboardPage } from './pages/DashboardPage';
import { GoalDetailPage } from './pages/GoalDetailPage';
import { CreateGoalModal } from './components/dashboard/CreateGoalModal';
import { WelcomeScreen } from './components/welcome/WelcomeScreen';
import { ShareModal } from './components/common/ShareModal';
import { SharePreviewScreen } from './components/common/SharePreviewScreen';
import { ArisChatModal } from './components/aris/ArisChatModal';
import { PomodoroModal } from './components/pomodoro/PomodoroModal';
import { StatsModal } from './components/stats/StatsModal';
import { PomodoroProvider, usePomodoro } from './context/PomodoroContext';
import { decodeRoadmap, type SharedRoadmapPayload } from './utils/shareUtils';
import { calculateGlobalStats } from './utils/streak';

const USER_NAME_KEY = 'arrow_user_name';

function AppContent() {
  const { pomodorosToday } = usePomodoro();
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const {
    goals,
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
  } = useGoals();

  // Onboarding user name state
  const [userName, setUserName] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(USER_NAME_KEY);
      return saved ? saved.trim() : null;
    }
    return null;
  });

  const [activeGoalId, setActiveGoalId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.startsWith('#/goal/')) {
        return hash.replace('#/goal/', '');
      }
    }
    return null;
  });

  // Shared roadmap payload detected from URL hash or manual import
  const [sharedRoadmapPayload, setSharedRoadmapPayload] = useState<SharedRoadmapPayload | null>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.startsWith('#/share')) {
        return decodeRoadmap(hash);
      }
    }
    return null;
  });

  const [sharingGoalId, setSharingGoalId] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isArisOpen, setIsArisOpen] = useState(false);
  const toast = useToast();

  // Keep URL hash synchronized for browser navigation & PWA window history
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/goal/')) {
        const id = hash.replace('#/goal/', '');
        setActiveGoalId(id);
        setSharedRoadmapPayload(null);
      } else if (hash.startsWith('#/share')) {
        const decoded = decodeRoadmap(hash);
        setSharedRoadmapPayload(decoded);
        setActiveGoalId(null);
      } else {
        setActiveGoalId(null);
        setSharedRoadmapPayload(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSaveUserName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      localStorage.setItem(USER_NAME_KEY, trimmed);
    } catch (e) {
      console.warn('Could not save user name to localStorage:', e);
    }
    setUserName(trimmed);
    toast.success(`Welcome to Arrow, ${trimmed}! 🎯`, 'Your goal tracker is ready to launch.');
  };

  const navigateToGoal = (goalId: string) => {
    setActiveGoalId(goalId);
    setSharedRoadmapPayload(null);
    window.location.hash = `#/goal/${goalId}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateHome = () => {
    setActiveGoalId(null);
    setSharedRoadmapPayload(null);
    window.location.hash = '#/';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateGoalSubmit = (
    name: string,
    totalDays: number,
    startDate?: string,
    endDate?: string
  ) => {
    const newGoal = createGoal(name, totalDays, startDate, endDate);
    toast.success('Goal Created! 🚀', `"${name}" with ${totalDays} days roadmap generated.`);
    navigateToGoal(newGoal.id);
  };

  const handleImportSharedRoadmap = (payload: SharedRoadmapPayload) => {
    const newGoal = importSharedRoadmap(payload);
    setSharedRoadmapPayload(null);
    toast.success('Roadmap Added! 🎯', `"${newGoal.name}" is now ready in your dashboard.`);
    navigateToGoal(newGoal.id);
  };

  // If user has not entered their name yet, gate with the onboarding WelcomeScreen
  if (!userName) {
    return <WelcomeScreen onComplete={handleSaveUserName} />;
  }

  const activeGoal = activeGoalId ? getGoalById(activeGoalId) : undefined;
  const sharingGoal = sharingGoalId ? getGoalById(sharingGoalId) || null : null;
  const globalStats = calculateGlobalStats(goals);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#080d19] text-slate-900 dark:text-slate-100 transition-colors relative overflow-x-hidden selection:bg-blue-500/20 selection:text-blue-700 dark:selection:text-blue-300">
      {/* Spatial Ambient Depth Layers */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-blue-500/12 via-sky-400/6 to-transparent dark:from-blue-600/20 dark:via-sky-500/10 dark:to-transparent rounded-full blur-3xl opacity-80" />
        <div className="absolute top-1/3 -left-48 w-[500px] h-[500px] bg-blue-400/6 dark:bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-48 w-[600px] h-[600px] bg-sky-400/6 dark:bg-sky-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header
          userName={userName}
          onUpdateUserName={handleSaveUserName}
          onNavigateHome={navigateHome}
          globalStreak={globalStats.highestStreak}
          totalGoalsCount={goals.length}
          onExport={exportGoals}
          onImport={importGoals}
          onImportSharedRoadmap={handleImportSharedRoadmap}
          onToggleAris={() => setIsArisOpen((prev) => !prev)}
          isArisOpen={isArisOpen}
        />

        <main className="flex-1">
        {sharedRoadmapPayload ? (
          <SharePreviewScreen
            payload={sharedRoadmapPayload}
            onAddToMyGoals={handleImportSharedRoadmap}
            onCancel={navigateHome}
          />
        ) : activeGoal ? (
          <GoalDetailPage
            goal={activeGoal}
            onBack={navigateHome}
            onUpdateGoalName={(newName) => updateGoalName(activeGoal.id, newName)}
            onDeleteGoal={(id) => {
              deleteGoal(id);
              navigateHome();
            }}
            onToggleDayCompletion={(dayNumber) =>
              toggleDayCompletion(activeGoal.id, dayNumber)
            }
            onUpdateDayTopic={(dayNumber, topic) =>
              updateDayTopic(activeGoal.id, dayNumber, topic)
            }
            onAddResource={(dayNumber, url, title) =>
              addDayResource(activeGoal.id, dayNumber, url, title)
            }
            onUpdateResource={(dayNumber, resId, url, title) =>
              updateDayResource(activeGoal.id, dayNumber, resId, url, title)
            }
            onRemoveResource={(dayNumber, resId) =>
              removeDayResource(activeGoal.id, dayNumber, resId)
            }
            onSaveDayLog={(dayNumber, text) =>
              saveDayLog(activeGoal.id, dayNumber, text)
            }
            onDeleteDayLog={(dayNumber) =>
              deleteDayLog(activeGoal.id, dayNumber)
            }
            onShareGoal={(goal) => setSharingGoalId(goal.id)}
            onAddDay={() => {
              const newDay = addDayToGoal(activeGoal.id);
              if (newDay) {
                toast.success(`Day ${newDay.dayNumber} Added! 🚀`, 'Added next milestone day to your roadmap.');
              }
            }}
            onDeleteDay={(dayNum) => {
              deleteDayFromGoal(activeGoal.id, dayNum);
            }}
          />
        ) : (
          <DashboardPage
            goals={goals}
            userName={userName}
            onSelectGoal={navigateToGoal}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onDeleteGoal={(id) => deleteGoal(id)}
            onShareGoal={(goal) => setSharingGoalId(goal.id)}
            onOpenStats={() => setIsStatsOpen(true)}
          />
        )}
      </main>

      <Footer />

      {/* Global Create Goal Modal */}
      <CreateGoalModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateGoalSubmit}
      />

      {/* Share Roadmap Modal */}
      <ShareModal
        isOpen={Boolean(sharingGoalId && sharingGoal)}
        goal={sharingGoal}
        onClose={() => setSharingGoalId(null)}
      />

      {/* Aris AI Assistant Chat Modal */}
      <ArisChatModal
        isOpen={isArisOpen}
        onClose={() => setIsArisOpen(false)}
        userName={userName || 'Learner'}
        goals={goals}
        globalStreak={globalStats.highestStreak}
        pomodorosToday={pomodorosToday}
      />

      {/* Pomodoro Timer Modal */}
      <PomodoroModal />

      {/* Overall Statistics Modal */}
      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        goals={goals}
      />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <PomodoroProvider>
        <AppContent />
      </PomodoroProvider>
    </ToastProvider>
  );
}
