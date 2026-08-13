'use client';

import React from 'react';
import { TimerStatus, TimerMode } from '@/hooks/usePomodoroTimer';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';

interface TimerControlsProps {
  status: TimerStatus;
  mode: TimerMode;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onRequestReset: () => void;
  onSkip: () => void;
}

export const TimerControls: React.FC<TimerControlsProps> = ({
  status,
  mode,
  onStart,
  onPause,
  onResume,
  onRequestReset,
  onSkip,
}) => {
  // Button background colors tailored to mode
  let primaryBtnColor = 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25 focus:ring-indigo-500/50';
  if (mode === 'shortBreak') {
    primaryBtnColor = 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25 focus:ring-emerald-500/50';
  } else if (mode === 'longBreak') {
    primaryBtnColor = 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-500/25 focus:ring-cyan-500/50';
  } else if (mode === 'stopwatch') {
    primaryBtnColor = 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/25 focus:ring-purple-500/50';
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-xs mt-2">
      <div className="flex items-center justify-center gap-3 w-full">
        {/* Primary Action Button */}
        {status === 'idle' && (
          <button
            onClick={onStart}
            aria-label="Iniciar timer"
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-white font-semibold text-lg shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 ${primaryBtnColor}`}
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Iniciar</span>
          </button>
        )}

        {status === 'running' && (
          <button
            onClick={onPause}
            aria-label="Pausar timer"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-lg shadow-lg shadow-amber-500/25 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-amber-500/50"
          >
            <Pause className="w-5 h-5 fill-current" />
            <span>Pausar</span>
          </button>
        )}

        {status === 'paused' && (
          <button
            onClick={onResume}
            aria-label="Continuar timer"
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-white font-semibold text-lg shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 ${primaryBtnColor}`}
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Continuar</span>
          </button>
        )}

        {status === 'finished' && (
          <button
            onClick={onStart}
            aria-label="Reiniciar nova sessão"
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-white font-semibold text-lg shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 ${primaryBtnColor}`}
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Nova Sessão</span>
          </button>
        )}

        {/* Secondary Reset Button */}
        <button
          onClick={onRequestReset}
          aria-label="Reiniciar timer para o tempo inicial"
          title={mode === 'stopwatch' ? 'Zerar e salvar tempo do cronômetro' : 'Reiniciar tempo'}
          className="p-3.5 rounded-2xl bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Skip Session Button (Only for countdown modes) */}
      {mode !== 'stopwatch' && (status === 'running' || status === 'paused') && (
        <button
          onClick={onSkip}
          aria-label="Pular sessão atual"
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 bg-zinc-900/60 hover:bg-zinc-800/60 border border-zinc-800/80 transition-all focus:outline-none"
        >
          <SkipForward className="w-3.5 h-3.5" />
          <span>Pular sessão</span>
        </button>
      )}
    </div>
  );
};
