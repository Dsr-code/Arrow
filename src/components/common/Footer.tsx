import { Target } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full mt-auto py-8 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md text-slate-500 dark:text-slate-400 text-xs transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-medium">
          <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="font-bold text-slate-700 dark:text-slate-200">Arrow</span>
          <span>•</span>
          <span>Local & Private</span>
        </div>
        
        {/* Author Credit */}
        <div className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
          <span>a project by</span>
          <span className="text-blue-600 dark:text-blue-400 font-bold hover:text-blue-500 transition-colors">dsr❤️</span>
        </div>
      </div>
    </footer>
  );
}
