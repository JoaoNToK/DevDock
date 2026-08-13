'use client';

import React from 'react';
import { Award, Clock, Trash2 } from 'lucide-react';

interface SessionCounterProps {
  completedSessions: number;
  totalFocusMinutes: number;
  onClearSessions: () => void;
}

export const SessionCounter: React.FC<SessionCounterProps> = ({
  completedSessions,
  totalFocusMinutes,
  onClearSessions,
}) => {
  // Format total focus minutes into human readable hours and minutes (e.g. 105 min -> 1h 45m)
  const formatTotalTime = (totalMins: number) => {
    if (totalMins < 60) {
      return `${totalMins} min`;
    }
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="w-full max-w-sm mt-6 p-4 rounded-2xl bg-white/60 dark:bg-black/60 backdrop-blur-sm border border-slate-200/60 dark:border-zinc-800/80 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        {/* Completed Sessions */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 dark:bg-amber-500/20">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
              Sessões
            </span>
            <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
              {completedSessions}
            </span>
          </div>
        </div>

        <div className="w-[1px] h-8 bg-slate-200 dark:bg-zinc-800" />

        {/* Total Focus Time */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
              Tempo focado
            </span>
            <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
              {formatTotalTime(totalFocusMinutes)}
            </span>
          </div>
        </div>
      </div>

      {(completedSessions > 0 || totalFocusMinutes > 0) && (
        <button
          onClick={onClearSessions}
          aria-label="Limpar histórico de sessões"
          title="Limpar histórico"
          className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
