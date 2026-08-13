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
    <div className="w-full max-w-lg p-1.5 rounded-2xl bg-slate-100/80 dark:bg-black/90 backdrop-blur-sm flex items-center gap-1 border border-slate-200/50 dark:border-zinc-800/80 shadow-inner">
      {modes.map(({ id, label, icon: Icon }) => {
        const isActive = currentMode === id;

        let activeBgClass = 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-transparent dark:border-zinc-800';
        if (id === 'shortBreak' && isActive) {
          activeBgClass = 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-transparent dark:border-zinc-800';
        } else if (id === 'longBreak' && isActive) {
          activeBgClass = 'bg-white dark:bg-zinc-900 text-cyan-600 dark:text-cyan-400 shadow-sm border border-transparent dark:border-zinc-800';
        } else if (id === 'stopwatch' && isActive) {
          activeBgClass = 'bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-sm border border-transparent dark:border-zinc-800';
        }

        return (
          <button
            key={id}
            onClick={() => onSelectMode(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
              isActive
                ? `${activeBgClass} font-semibold scale-[1.02]`
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-200/50 dark:hover:bg-zinc-900/50'
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
