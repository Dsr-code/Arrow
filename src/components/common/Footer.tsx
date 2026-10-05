import { Target } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full mt-auto py-8 border-t border-slate-200/60 dark:border-purple-900/40 text-slate-400 dark:text-purple-300/70 text-xs transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-medium">
          <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="font-bold text-slate-700 dark:text-purple-200">Arrow</span>
          <span>•</span>
          <span>Local & Private</span>
        </div>
        
        {/* Author Credit */}
        <div className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-purple-300">
          <span>a project by</span>
          <span className="text-purple-600 dark:text-purple-400 font-bold">dsr❤️</span>
        </div>
      </div>
    </footer>
  );
}
