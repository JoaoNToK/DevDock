'use client';

import React from 'react';
import { TimerMode } from '@/hooks/usePomodoroTimer';
import { Brain, Coffee, Sparkles, Timer } from 'lucide-react';

interface TimerModeSelectorProps {
  currentMode: TimerMode;
  onSelectMode: (mode: TimerMode) => void;
}

export const TimerModeSelector: React.FC<TimerModeSelectorProps> = ({
  currentMode,
  onSelectMode,
}) => {
  const modes: { id: TimerMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'focus', label: 'Foco', icon: Brain },
    { id: 'shortBreak', label: 'Pausa curta', icon: Coffee },
    { id: 'longBreak', label: 'Pausa longa', icon: Sparkles },
    { id: 'stopwatch', label: 'Cronômetro', icon: Timer },
  ];

  return (
    <div className="w-full max-w-lg p-1.5 rounded-2xl theme-surface backdrop-blur-sm flex items-center gap-1 border shadow-inner">
      {modes.map(({ id, label, icon: Icon }) => {
        const isActive = currentMode === id;

        return (
          <button
            key={id}
            onClick={() => onSelectMode(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--border-color)] ${
              isActive
                ? 'btn-primary shadow-sm scale-[1.02]'
                : 'text-secondary-theme hover:text-primary-theme hover:bg-zinc-800/30'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'scale-110' : ''}`} />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{id === 'stopwatch' ? 'Cronômetro' : label}</span>
          </button>
        );
      })}
    </div>
  );
};
