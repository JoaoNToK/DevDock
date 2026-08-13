'use client';

import React from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { usePomodoroTimer } from '@/hooks/usePomodoroTimer';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { usePlannerActivities } from '@/hooks/usePlannerActivities';
import {
  Timer,
  Calendar,
  ClipboardList,
  BarChart2,
  Play,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function Home() {
  const {
    mode,
    status,
    timeRemaining,
    totalDurationSeconds,
    completedSessions,
    totalFocusMinutes,
    dailyGoal,
    tasks,
    activeTaskId,
    isMounted,
  } = usePomodoroTimer();

  const { events } = useCalendarEvents();
  const { activities } = usePlannerActivities();

  const todayStr = new Date().toISOString().split('T')[0];

  const activeTask = tasks.find((t) => t.id === activeTaskId) || tasks[0] || null;
  const todayActivities = activities.filter((a) => a.dateString === todayStr);
  const todayEvents = events.filter((e) => e.dateString === todayStr);

  const mins = Math.floor(timeRemaining / 60);
  const secs = timeRemaining % 60;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  if (!isMounted) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="w-8 h-8 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Welcome Hero Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/80 via-zinc-900 to-zinc-900 border border-indigo-500/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl z-10">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Visão 360° do seu dia</span>
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Painel de Foco DevDock
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Combine seu Pomodoro, compromissos do calendário e planejamento em uma única plataforma integrada.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3 z-10 w-full md:w-auto">
            <Link
              href="/pomodoro"
              className="py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 flex-1 md:flex-none"
            >
              <Timer className="w-4 h-4" />
              <span>Abrir Pomodoro Timer</span>
            </Link>
          </div>
        </div>

        {/* 360 Grid Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Quick Timer Status & Today's Summary */}
          <div className="lg:col-span-7 space-y-6">
            {/* Quick Timer Card */}
            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  Timer Atual ({mode === 'focus' ? 'Foco' : mode === 'shortBreak' ? 'Pausa Curta' : mode === 'longBreak' ? 'Pausa Longa' : 'Cronômetro'})
                </span>
                <p className="text-4xl sm:text-5xl font-extrabold text-white font-mono tracking-tight">
                  {formattedTime}
                </p>
                {activeTask && (
                  <p className="text-xs text-indigo-400 font-semibold truncate max-w-xs">
                    🎯 {activeTask.title}
                  </p>
                )}
              </div>

              <Link
                href="/pomodoro"
                className="py-3.5 px-6 rounded-2xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4 text-emerald-400 fill-current" />
                <span>Ir para o Timer</span>
              </Link>
            </div>

            {/* Today's Planning Activities */}
            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Atividades de Hoje ({todayActivities.length})</h3>
                </div>
                <Link
                  href="/planejamento/diario"
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <span>Ver todas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {todayActivities.length === 0 ? (
                <p className="text-xs text-zinc-500 py-4 text-center">Nenhuma atividade planejada para hoje.</p>
              ) : (
                <div className="space-y-2">
                  {todayActivities.slice(0, 4).map((act) => (
                    <div
                      key={act.id}
                      className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          className={`w-4 h-4 ${act.isCompleted ? 'text-emerald-400' : 'text-zinc-600'}`}
                        />
                        <span className={`font-semibold ${act.isCompleted ? 'line-through text-zinc-500' : 'text-white'}`}>
                          {act.title}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-indigo-400" />
                        {act.startTime}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Upcoming Calendar Events & Quick Reports */}
          <div className="lg:col-span-5 space-y-6">
            {/* Upcoming Calendar Events */}
            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">Eventos do Dia ({todayEvents.length})</h3>
                </div>
                <Link
                  href="/calendario"
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <span>Calendário</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {todayEvents.length === 0 ? (
                <p className="text-xs text-zinc-500 py-4 text-center">Nenhum evento no calendário hoje.</p>
              ) : (
                <div className="space-y-2">
                  {todayEvents.slice(0, 3).map((evt) => (
                    <div
                      key={evt.id}
                      className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-white">{evt.title}</p>
                        <p className="text-[10px] text-zinc-400">{evt.category}</p>
                      </div>
                      <span className="font-mono text-[10px] text-indigo-400 font-bold">
                        {evt.startTime} - {evt.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Reports Widget */}
            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Resumo de Produtividade</h3>
                </div>
                <Link
                  href="/relatorios"
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <span>Relatórios</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px]">Sessões de Foco</span>
                  <span className="text-xl font-extrabold text-white font-mono">{completedSessions}</span>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px]">Tempo Total</span>
                  <span className="text-xl font-extrabold text-white font-mono">
                    {(totalFocusMinutes / 60).toFixed(1)}h
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
