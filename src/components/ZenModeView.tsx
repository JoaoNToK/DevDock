'use client';

import React, { useEffect } from 'react';
import { TimerMode, TimerStatus } from '@/hooks/usePomodoroTimer';
import { TimerModeSelector } from '@/components/TimerModeSelector';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { TimerControls } from '@/components/TimerControls';
import { Eye, Maximize2, Minimize2 } from 'lucide-react';

interface ZenModeViewProps {
  mode: TimerMode;
  status: TimerStatus;
  timeRemaining: number;
  totalDurationSeconds: number;
  activeTaskTitle?: string | null;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onRequestReset: () => void;
  onSkip: () => void;
  onSelectMode: (mode: TimerMode) => void;
  onExitZenMode: () => void;
}

export const ZenModeView: React.FC<ZenModeViewProps> = ({
  mode,
  status,
  timeRemaining,
  totalDurationSeconds,
  activeTaskTitle,
  isFullscreen,
  onToggleFullscreen,
  onStart,
  onPause,
  onResume,
  onRequestReset,
  onSkip,
  onSelectMode,
  onExitZenMode,
}) => {
  // Listen for Escape key to exit Zen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExitZenMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExitZenMode]);

  return (
    <div className="fixed inset-0 z-40 bg-black flex flex-col items-center justify-between p-6 sm:p-10 animate-fade-in text-white">
      {/* Top Floating Control Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Modo Minimalista (Zen)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Fullscreen button */}
          <button
            onClick={onToggleFullscreen}
            className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors text-xs flex items-center gap-1.5 font-medium"
            title="Alternar Tela Cheia"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-indigo-400" />
            ) : (
              <Maximize2 className="w-4 h-4 text-indigo-400" />
            )}
            <span className="hidden sm:inline">{isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}</span>
          </button>

          {/* Exit Zen Mode button */}
          <button
            onClick={onExitZenMode}
            className="py-2 px-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors text-xs font-semibold flex items-center gap-1.5"
            title="Sair do modo minimalista (Esc)"
          >
            <Eye className="w-4 h-4 text-indigo-400" />
            <span>Sair do Modo Zen</span>
          </button>
        </div>
      </div>

      {/* Main Centered Minimal Timer */}
      <div className="flex flex-col items-center justify-center my-auto w-full max-w-md space-y-6">
        {/* Mode Selector */}
        <TimerModeSelector currentMode={mode} onSelectMode={onSelectMode} />

        {/* Giant Timer Display */}
        <PomodoroTimer
          timeRemaining={timeRemaining}
          totalDurationSeconds={totalDurationSeconds}
          mode={mode}
          status={status}
          activeTaskTitle={activeTaskTitle}
        />

        {/* Controls */}
        <TimerControls
          status={status}
          mode={mode}
          onStart={onStart}
          onPause={onPause}
          onResume={onResume}
          onRequestReset={onRequestReset}
          onSkip={onSkip}
        />
      </div>

      {/* Footer Helper */}
      <div className="text-center text-[11px] text-zinc-600 font-medium">
        Pressione <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">Esc</kbd> para sair do modo minimalista
      </div>
    </div>
  );
};
