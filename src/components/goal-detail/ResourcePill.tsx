import { motion } from 'framer-motion';
import { Play, Code, ExternalLink } from 'lucide-react';
import type { Resource } from '../../types/goal';

interface ResourcePillProps {
  resource: Resource;
}

export function ResourcePill({ resource }: ResourcePillProps) {
  const getResourceConfig = () => {
    switch (resource.type) {
      case 'youtube':
        return {
          icon: <Play className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />,
          label: 'Watch on YouTube',
          badgeClass:
            'bg-rose-50/90 text-rose-700 border-rose-200/80 hover:bg-rose-100/90 hover:border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60 dark:hover:bg-rose-900/40',
        };
      case 'practice':
        return {
          icon: <Code className="w-3.5 h-3.5 text-indigo-500 shrink-0" />,
          label: 'Practice',
          badgeClass:
            'bg-indigo-50/90 text-indigo-700 border-indigo-200/80 hover:bg-indigo-100/90 hover:border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900/60 dark:hover:bg-indigo-900/40',
        };
      case 'generic':
      default:
        return {
          icon: <ExternalLink className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />,
          label: 'Open Resource',
          badgeClass:
            'bg-slate-100/90 text-slate-700 border-slate-200 hover:bg-slate-200/70 hover:border-slate-300 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700/80',
        };
    }
  };

  const config = getResourceConfig();

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="inline-flex items-center"
    >
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        title={resource.title ? `${config.label}: ${resource.title}` : config.label}
        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 shadow-sm ${config.badgeClass}`}
      >
        {config.icon}
        <span>{config.label}</span>
      </a>
    </motion.div>
  );
}
