import { motion } from 'framer-motion';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  showText?: boolean;
  className?: string;
  subText?: string;
}

export function CircularProgress({
  percentage,
  size = 72,
  strokeWidth = 6,
  showText = true,
  className = '',
  subText,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const validPercentage = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (validPercentage / 100) * circumference;

  const isComplete = validPercentage === 100;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90 origin-center"
      >
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#6366f1" />
            <stop offset="100%" stop-color="#8b5cf6" />
          </linearGradient>
          <linearGradient id="completeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#10b981" />
            <stop offset="100%" stop-color="#059669" />
          </linearGradient>
        </defs>

        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-100 dark:text-slate-800"
          fill="transparent"
        />

        {/* Animated Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isComplete ? 'url(#completeGradient)' : 'url(#progressGradient)'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>

      {showText && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
          <motion.span
            key={validPercentage}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`font-bold tracking-tight ${
              size < 60 ? 'text-xs' : size < 80 ? 'text-sm' : 'text-base'
            } ${
              isComplete
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-800 dark:text-slate-100'
            }`}
          >
            {validPercentage}%
          </motion.span>
          {subText && (
            <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
              {subText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
