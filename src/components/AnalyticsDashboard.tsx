'use client';

import React, { useMemo, useState } from 'react';
import { SessionRecord } from '@/types/analytics';
import { getAnalyticsSummary } from '@/utils/analyticsUtils';
import { ProductivityChart } from '@/components/ProductivityChart';
import {
  X,
  Trophy,
  Flame,
  Clock,
  CalendarCheck,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { TimerMode } from '@/hooks/usePomodoroTimer';

interface AnalyticsDashboardProps {
  isOpen: boolean;
  records: SessionRecord[];
  totalFocusMinutes: number;
  dailyGoal: number;
  onClose: () => void;
  onClearHistory: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  isOpen,
  records,
  totalFocusMinutes,
  dailyGoal,
  onClose,
  onClearHistory,
}) => {
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const summary = useMemo(() => {
    return getAnalyticsSummary(records, totalFocusMinutes, dailyGoal);
  }, [records, totalFocusMinutes, dailyGoal]);

  const focusRecords = useMemo(() => {
    return records.filter((r) => r.mode === 'focus' || r.mode === 'stopwatch').slice().reverse();
  }, [records]);

  if (!isOpen) return null;

  const formatDateDisplay = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const getRecordLabel = (m: TimerMode) => {
    if (m === 'stopwatch') return 'Cronômetro';
    return 'Foco';
  };

  const getRecordDotColor = (m: TimerMode) => {
    if (m === 'stopwatch') return 'bg-purple-500';
    return 'bg-indigo-500';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl my-auto p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl text-white space-y-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          aria-label="Fechar estatísticas"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">Estatísticas &amp; Produtividade</h3>
            <p className="text-xs text-zinc-400">Acompanhe seu desempenho diário, semanal e mensal</p>
          </div>
        </div>

        {/* Daily Goal Progress Bar */}
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Progresso da Meta Diária ({summary.todayCount}/{dailyGoal} Pomodoros)
            </span>
            <span className="font-bold text-indigo-400">{summary.todayProgressPercent}%</span>
          </div>

          <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden p-0.5 border border-zinc-700/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 transition-all duration-500"
              style={{ width: `${summary.todayProgressPercent}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Total Focus Hours */}
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-1">
            <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-semibold">
              <Clock className="w-4 h-4" />
              <span>Total Estudado</span>
            </div>
            <p className="text-xl font-extrabold text-white font-mono">{summary.totalFocusHours}h</p>
            <p className="text-[10px] text-zinc-500">{summary.totalFocusMinutes} minutos acumulados</p>
          </div>

          {/* Streak Days */}
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
              <Flame className="w-4 h-4" />
              <span>Sequência</span>
            </div>
            <p className="text-xl font-extrabold text-white font-mono">{summary.streakDays} dias</p>
            <p className="text-[10px] text-zinc-500">Dias seguidos focados</p>
          </div>

          {/* Daily Average */}
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
              <CalendarCheck className="w-4 h-4" />
              <span>Média Diária</span>
            </div>
            <p className="text-xl font-extrabold text-white font-mono">{summary.dailyAverageMinutes} min</p>
            <p className="text-[10px] text-zinc-500">Média por dia</p>
          </div>

          {/* Best Day of Week */}
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-1">
            <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-semibold">
              <Trophy className="w-4 h-4" />
              <span>Melhor Dia</span>
            </div>
            <p className="text-xl font-extrabold text-white truncate">
              {summary.bestDayOfWeek || 'N/A'}
            </p>
            <p className="text-[10px] text-zinc-500">{summary.monthlyMinutes} min neste mês</p>
          </div>
        </div>

        {/* 7-Day Productivity Bar Chart */}
        <ProductivityChart data={summary.chartData} />

        {/* Session History List */}
        <div className="space-y-3 pt-2 border-t border-zinc-800/80">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Histórico de Sessões ({focusRecords.length})
            </h4>

            {focusRecords.length > 0 && (
              <button
                onClick={() => setShowConfirmClear(true)}
                className="text-xs font-medium text-zinc-500 hover:text-red-400 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar Histórico</span>
              </button>
            )}
          </div>

          {/* Confirm Clear Modal Overlay */}
          {showConfirmClear && (
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-900/60 text-xs text-red-200 flex items-center justify-between gap-3">
              <span>Tem certeza? Todo o histórico de estatísticas será apagado.</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="px-3 py-1 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setShowConfirmClear(false);
                    onClearHistory();
                  }}
                  className="px-3 py-1 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
                >
                  Sim, limpar
                </button>
              </div>
            </div>
          )}

          <div className="max-h-48 overflow-y-auto rounded-2xl border border-zinc-800/80 bg-zinc-900/40 divide-y divide-zinc-800/60">
            {focusRecords.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-500">
                Nenhuma sessão de foco concluída ainda. Comece um timer para registrar seu progresso!
              </div>
            ) : (
              focusRecords.map((r) => (
                <div key={r.id} className="py-2.5 px-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${getRecordDotColor(r.mode)}`} />
                    <span className="font-medium text-zinc-200">{getRecordLabel(r.mode)} Concluído</span>
                  </div>
                  <div className="flex items-center gap-4 text-zinc-400 font-mono">
                    <span>{formatDateDisplay(r.dateString)} às {r.timeString}</span>
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 font-semibold">
                      {r.durationMinutes} min
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
