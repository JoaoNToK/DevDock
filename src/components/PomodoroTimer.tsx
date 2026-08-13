'use client';

import React from 'react';
import { formatTime } from '@/utils/formatTime';
import { TimerMode, TimerStatus } from '@/hooks/usePomodoroTimer';
import { Target } from 'lucide-react';

interface PomodoroTimerProps {
  timeRemaining: number;
  totalDurationSeconds: number;
  mode: TimerMode;
  status: TimerStatus;
  activeTaskTitle?: string | null;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  timeRemaining,
  totalDurationSeconds,
  mode,
  status,
  activeTaskTitle,
}) => {
  const formattedTime = formatTime(timeRemaining);

  // SVG ring calculations
  const radius = 120;
  const circumference = 2 * Math.PI * radius;

  // In stopwatch mode, ring fills continuously every 60 seconds
  let strokeDashoffset = 0;
  if (mode === 'stopwatch') {
    const cycleSeconds = timeRemaining % 60;
    const progressRatio = cycleSeconds / 60;
    strokeDashoffset = circumference * (1 - progressRatio);
  } else {
    const progressRatio = totalDurationSeconds > 0 ? timeRemaining / totalDurationSeconds : 0;
    strokeDashoffset = circumference * (1 - progressRatio);
  }

  // Dynamic theme accents based on mode
  let strokeColor = 'stroke-indigo-500';
  let badgeColor = 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
  let pulseGlow = 'drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]';

  if (mode === 'shortBreak') {
    strokeColor = 'stroke-emerald-500';
    badgeColor = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    pulseGlow = 'drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]';
  } else if (mode === 'longBreak') {
    strokeColor = 'stroke-cyan-500';
    badgeColor = 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/80 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
    pulseGlow = 'drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]';
  } else if (mode === 'stopwatch') {
    strokeColor = 'stroke-purple-500';
    badgeColor = 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    pulseGlow = 'drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]';
  }

  // Readable status text
  const getStatusText = () => {
    switch (status) {
      case 'idle':
        return mode === 'stopwatch' ? 'Cronômetro pronto' : 'Pronto para começar';
      case 'running':
        return mode === 'stopwatch' ? 'Contando tempo...' : 'Em andamento...';
      case 'paused':
        return 'Pausado';
      case 'finished':
        return 'Sessão finalizada!';
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center my-6 sm:my-8 group">
      {/* SVG Circular Progress Bar */}
      <div className={`relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center transition-all duration-300 ${status === 'running' ? pulseGlow : ''}`}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 280 280">
          {/* Background Ring */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            className="stroke-slate-200 dark:stroke-zinc-800/80"
            strokeWidth="12"
            fill="transparent"
          />
          {/* Animated Progress Ring */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            className={`${strokeColor} transition-all duration-300 ease-out`}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Timer Time Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <span
            aria-live="polite"
            className={`font-extrabold tracking-tight font-mono text-slate-900 dark:text-white transition-all select-none ${
              timeRemaining >= 3600 ? 'text-4xl sm:text-5xl' : 'text-5xl sm:text-6xl'
            }`}
          >
            {formattedTime}
          </span>

          {/* Active Task Badge */}
          {activeTaskTitle ? (
            <div className="mt-2.5 max-w-[200px] flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/90 text-indigo-300 border border-indigo-800/80 text-xs font-medium truncate shadow-sm">
              <Target className="w-3.5 h-3.5 text-indigo-400 shrink-0 animate-pulse" />
              <span className="truncate">{activeTaskTitle}</span>
            </div>
          ) : (
            <div
              className={`mt-3 px-3.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm transition-all duration-200 ${badgeColor}`}
            >
              {getStatusText()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
