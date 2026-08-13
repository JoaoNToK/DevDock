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

  // Today Stats
  const todaySessions = useMemo(() => {
    return records.filter((r) => r.dateString === todayStr && (r.mode === 'focus' || r.mode === 'stopwatch'));
  }, [records, todayStr]);

  const todayFocusMinutes = useMemo(() => {
    return todaySessions.reduce((sum, r) => sum + r.durationMinutes, 0);
  }, [todaySessions]);

  const completedTasksCount = useMemo(() => {
    return tasks.filter((t) => t.isCompleted).length;
  }, [tasks]);

  // Last 7 Days Data
  const last7DaysData = useMemo(() => {
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const result: { label: string; value: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = dayNames[d.getDay()];

      const dayCount = records.filter(
        (r) => r.dateString === dateStr && (r.mode === 'focus' || r.mode === 'stopwatch')
      ).length;

      result.push({ label: dayName, value: dayCount });
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

  return (
    <div className="space-y-6">
      {/* Top Title Banner */}
      <div className="p-4 sm:p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
          <BarChart2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-white">Relatórios de Produtividade</h2>
          <p className="text-xs text-zinc-400 font-medium">Análise de desempenho diário, semanal e mensal</p>
        </div>
      </div>

      {/* TODAY SUMMARY GRID */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Hoje</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Pomodoros Concluídos */}
          <div className="p-4 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-1">
            <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-semibold">
              <Trophy className="w-4 h-4" />
              <span>Pomodoros</span>
            </div>
            <p className="text-2xl font-extrabold text-white font-mono">{todaySessions.length}</p>
            <p className="text-[10px] text-zinc-500">Sessões hoje</p>
          </div>

          {/* Tempo Focado Hoje */}
          <div className="p-4 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
              <Clock className="w-4 h-4" />
              <span>Tempo Focado</span>
            </div>
            <p className="text-2xl font-extrabold text-white font-mono">{todayFocusMinutes} min</p>
            <p className="text-[10px] text-zinc-500">{(todayFocusMinutes / 60).toFixed(1)} horas hoje</p>
          </div>

          {/* Tarefas Concluídas */}
          <div className="p-4 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-1">
            <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Tarefas</span>
            </div>
            <p className="text-2xl font-extrabold text-white font-mono">{completedTasksCount}</p>
            <p className="text-[10px] text-zinc-500">Total concluídas</p>
          </div>

          {/* Meta Diária */}
          <div className="p-4 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
              <Target className="w-4 h-4" />
              <span>Meta Diária</span>
            </div>
            <p className="text-2xl font-extrabold text-white font-mono">
              {todaySessions.length} / {dailyGoal}
            </p>
            <p className="text-[10px] text-zinc-500">
              {Math.min(100, Math.round((todaySessions.length / dailyGoal) * 100))}% concluído
            </p>
          </div>
        </div>
      </div>

      {/* WEEKLY & MONTHLY CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7-Day Pomodoros Chart */}
        <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">Pomodoros nos Últimos 7 Dias</h4>
              <p className="text-xs text-zinc-400">Distribuição de sessões de foco por dia da semana</p>
            </div>
            <Flame className="w-5 h-5 text-amber-400" />
          </div>

          <ResponsiveBarChart data={last7DaysData} accentColor="bg-indigo-600" />
        </div>

        {/* Activity Category Breakdown */}
        <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">Distribuição das Atividades</h4>
              <p className="text-xs text-zinc-400">Onde você está gastando seu tempo de planejamento</p>
            </div>
            <Calendar className="w-5 h-5 text-purple-400" />
          </div>

          <CategoryDistributionBar categories={categoryStats} />
        </div>
      </div>

      {/* MONTHLY SUMMARY CARD */}
      <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4">
        <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Resumo Geral da Conta</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80">
            <span className="text-xs text-zinc-400 font-semibold block">Total de Horas Estudadas</span>
            <span className="text-2xl font-extrabold font-mono text-indigo-400 mt-1 block">{totalFocusHours}h</span>
            <span className="text-[10px] text-zinc-500">{totalFocusMinutes} minutos acumulados</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80">
            <span className="text-xs text-zinc-400 font-semibold block">Total de Sessões Registradas</span>
            <span className="text-2xl font-extrabold font-mono text-emerald-400 mt-1 block">{records.length}</span>
            <span className="text-[10px] text-zinc-500">No histórico de foco</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80">
            <span className="text-xs text-zinc-400 font-semibold block">Tarefas no Sistema</span>
            <span className="text-2xl font-extrabold font-mono text-cyan-400 mt-1 block">{tasks.length}</span>
            <span className="text-[10px] text-zinc-500">{completedTasksCount} concluídas</span>
          </div>
        </div>
      </div>
    </div>
  );
};
