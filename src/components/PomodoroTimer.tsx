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

  // Official Monochromatic styling
  const strokeColor = 'stroke-[var(--text-primary)]';
  const badgeColor = 'theme-card-elevated border text-primary-theme';
  const pulseGlow = 'drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]';

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
            className="stroke-[var(--border-color)]"
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
            className={`font-extrabold tracking-tight font-mono text-primary-theme transition-all select-none ${
              timeRemaining >= 3600 ? 'text-4xl sm:text-5xl' : 'text-5xl sm:text-6xl'
            }`}
          >
            {formattedTime}
          </span>

          {/* Active Task Badge */}
          {activeTaskTitle ? (
            <div className="mt-2.5 max-w-[200px] flex items-center gap-1.5 px-3 py-1 rounded-full theme-card-elevated border text-primary-theme text-xs font-medium truncate shadow-sm">
              <Target className="w-3.5 h-3.5 text-secondary-theme shrink-0 animate-pulse" />
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
