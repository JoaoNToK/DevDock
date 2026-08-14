'use client';

import React, { useMemo } from 'react';
import { SessionRecord } from '@/types/analytics';
import { Task } from '@/types/task';
import { PlannerActivity } from '@/types/planner';
import { ResponsiveBarChart, CategoryDistributionBar } from '@/components/reports/ResponsiveCharts';
import {
  BarChart2,
  Clock,
  CheckCircle2,
  Target,
  Trophy,
  Flame,
  Calendar,
  RotateCcw,
  SkipForward,
} from 'lucide-react';

interface ProductivityReportsProps {
  records: SessionRecord[];
  tasks: Task[];
  activities: PlannerActivity[];
  totalFocusMinutes: number;
  dailyGoal: number;
}

export const ProductivityReports: React.FC<ProductivityReportsProps> = ({
  records,
  tasks,
  activities,
  totalFocusMinutes,
  dailyGoal,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate actual duration minutes for any record
  const getRecordActualMinutes = (r: SessionRecord) => {
    if (r.actualDurationSeconds !== undefined) {
      return Math.floor(r.actualDurationSeconds / 60);
    }
    return r.durationMinutes || 0;
  };

  // Today Focus Sessions
  const todayCompletedSessions = useMemo(() => {
    return records.filter(
      (r) =>
        r.dateString === todayStr &&
        (r.mode === 'focus' || r.mode === 'stopwatch') &&
        (r.status === 'COMPLETED' || !r.status)
    );
  }, [records, todayStr]);

  const todayAllSessions = useMemo(() => {
    return records.filter((r) => r.dateString === todayStr && (r.mode === 'focus' || r.mode === 'stopwatch'));
  }, [records, todayStr]);

  const todayFocusMinutes = useMemo(() => {
    return todayAllSessions.reduce((sum, r) => sum + getRecordActualMinutes(r), 0);
  }, [todayAllSessions]);

  const completedTasksCount = useMemo(() => {
    return tasks.filter((t) => t.isCompleted).length;
  }, [tasks]);

  // Last 7 Days Data (Count of completed sessions + total actual minutes)
  const last7DaysData = useMemo(() => {
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const result: { label: string; value: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = dayNames[d.getDay()];

      const dayCompletedCount = records.filter(
        (r) =>
          r.dateString === dateStr &&
          (r.mode === 'focus' || r.mode === 'stopwatch') &&
          (r.status === 'COMPLETED' || !r.status)
      ).length;

      result.push({ label: dayName, value: dayCompletedCount });
    }
    return result;
  }, [records]);

  // Activity Categories Breakdown
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {
      Estudos: 0,
      Trabalho: 0,
      Pessoal: 0,
      Saúde: 0,
      Outros: 0,
    };

    activities.forEach((a) => {
      if (counts[a.category] !== undefined) {
        counts[a.category] += 1;
      } else {
        counts['Outros'] += 1;
      }
    });

    return [
      { name: 'Estudos', count: counts['Estudos'], color: 'bg-indigo-500' },
      { name: 'Trabalho', count: counts['Trabalho'], color: 'bg-cyan-500' },
      { name: 'Pessoal', count: counts['Pessoal'], color: 'bg-emerald-500' },
      { name: 'Saúde', count: counts['Saúde'], color: 'bg-rose-500' },
      { name: 'Outros', count: counts['Outros'], color: 'bg-amber-500' },
    ];
  }, [activities]);

  const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);

  // Recent session records list (last 10)
  const recentRecords = useMemo(() => {
    return [...records].reverse().slice(0, 10);
  }, [records]);

  return (
    <div className="space-y-6">
      {/* Top Title Banner */}
      <div className="p-4 sm:p-6 rounded-3xl theme-surface border shadow-sm flex items-center gap-3">
        <div className="p-2.5 rounded-2xl theme-card-elevated border text-primary-theme">
          <BarChart2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-primary-theme">Relatórios de Produtividade Real</h2>
          <p className="text-xs text-secondary-theme font-medium">Análise baseada em tempo real de engajamento ativo</p>
        </div>
      </div>

      {/* TODAY SUMMARY GRID */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-secondary-theme">Hoje</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Pomodoros Concluídos */}
          <div className="p-4 rounded-3xl theme-surface border shadow-sm space-y-1">
            <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-semibold">
              <Trophy className="w-4 h-4" />
              <span>Sessões Concluídas</span>
            </div>
            <p className="text-2xl font-extrabold text-primary-theme font-mono">{todayCompletedSessions.length}</p>
            <p className="text-[10px] text-secondary-theme">Sessões completas (00:00)</p>
          </div>

          {/* Tempo Focado Hoje */}
          <div className="p-4 rounded-3xl theme-surface border shadow-sm space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
              <Clock className="w-4 h-4" />
              <span>Tempo Real Focado</span>
            </div>
            <p className="text-2xl font-extrabold text-primary-theme font-mono">{todayFocusMinutes} min</p>
            <p className="text-[10px] text-secondary-theme">{(todayFocusMinutes / 60).toFixed(1)} horas reais hoje</p>
          </div>

          {/* Tarefas Concluídas */}
          <div className="p-4 rounded-3xl theme-surface border shadow-sm space-y-1">
            <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Tarefas</span>
            </div>
            <p className="text-2xl font-extrabold text-primary-theme font-mono">{completedTasksCount}</p>
            <p className="text-[10px] text-secondary-theme">Total concluídas</p>
          </div>

          {/* Meta Diária */}
          <div className="p-4 rounded-3xl theme-surface border shadow-sm space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
              <Target className="w-4 h-4" />
              <span>Meta Diária</span>
            </div>
            <p className="text-2xl font-extrabold text-primary-theme font-mono">
              {todayCompletedSessions.length} / {dailyGoal}
            </p>
            <p className="text-[10px] text-secondary-theme">
              {Math.min(100, Math.round((todayCompletedSessions.length / dailyGoal) * 100))}% concluído
            </p>
          </div>
        </div>
      </div>

      {/* WEEKLY & MONTHLY CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7-Day Pomodoros Chart */}
        <div className="p-6 rounded-3xl theme-surface border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-primary-theme">Sessões Concluídas nos Últimos 7 Dias</h4>
              <p className="text-xs text-secondary-theme">Distribuição de pomodoros concluídos por dia</p>
            </div>
            <Flame className="w-5 h-5 text-amber-400" />
          </div>

          <ResponsiveBarChart data={last7DaysData} accentColor="bg-indigo-600" />
        </div>

        {/* Activity Category Breakdown */}
        <div className="p-6 rounded-3xl theme-surface border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-primary-theme">Distribuição das Atividades</h4>
              <p className="text-xs text-secondary-theme">Onde você está gastando seu tempo de planejamento</p>
            </div>
            <Calendar className="w-5 h-5 text-purple-400" />
          </div>

          <CategoryDistributionBar categories={categoryStats} />
        </div>
      </div>

      {/* RECENT HISTORICAL SESSIONS */}
      <div className="p-6 rounded-3xl theme-surface border shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-primary-theme uppercase tracking-wider">Histórico Recente de Sessões</h4>
        {recentRecords.length === 0 ? (
          <p className="text-xs text-secondary-theme py-4">Nenhuma sessão registrada ainda.</p>
        ) : (
          <div className="space-y-2">
            {recentRecords.map((r) => {
              const actualMins = getRecordActualMinutes(r);
              const statusLabel = r.status === 'COMPLETED' ? 'Concluído' : r.status === 'SKIPPED' ? 'Pulado' : r.status === 'RESET' ? 'Reiniciado' : 'Concluído';
              const statusColor = r.status === 'COMPLETED' || !r.status ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : r.status === 'SKIPPED' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-zinc-800 text-zinc-400 border-zinc-700';

              return (
                <div key={r.id} className="p-3 rounded-2xl theme-card-elevated border flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    {r.status === 'COMPLETED' || !r.status ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : r.status === 'SKIPPED' ? (
                      <SkipForward className="w-4 h-4 text-amber-400" />
                    ) : (
                      <RotateCcw className="w-4 h-4 text-zinc-400" />
                    )}
                    <div>
                      <span className="font-bold text-primary-theme capitalize block">{r.mode === 'focus' ? 'Foco' : r.mode}</span>
                      <span className="text-[10px] text-secondary-theme">{r.dateString} às {r.timeString}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-primary-theme">{actualMins} min reais</span>
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-extrabold ${statusColor}`}>
                      {statusLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MONTHLY SUMMARY CARD */}
      <div className="p-6 rounded-3xl theme-surface border shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-secondary-theme uppercase tracking-wider">Resumo Geral da Conta</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl theme-card-elevated border">
            <span className="text-xs text-secondary-theme font-semibold block">Total de Horas Reais Focadas</span>
            <span className="text-2xl font-extrabold font-mono text-indigo-400 mt-1 block">{totalFocusHours}h</span>
            <span className="text-[10px] text-secondary-theme">{totalFocusMinutes} minutos reais acumulados</span>
          </div>

          <div className="p-4 rounded-2xl theme-card-elevated border">
            <span className="text-xs text-secondary-theme font-semibold block">Total de Sessões Registradas</span>
            <span className="text-2xl font-extrabold font-mono text-emerald-400 mt-1 block">{records.length}</span>
            <span className="text-[10px] text-secondary-theme">No histórico de foco</span>
          </div>

          <div className="p-4 rounded-2xl theme-card-elevated border">
            <span className="text-xs text-secondary-theme font-semibold block">Tarefas no Sistema</span>
            <span className="text-2xl font-extrabold font-mono text-cyan-400 mt-1 block">{tasks.length}</span>
            <span className="text-[10px] text-secondary-theme">{completedTasksCount} concluídas</span>
          </div>
        </div>
      </div>
    </div>
  );
};
