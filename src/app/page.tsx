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
          <div className="w-8 h-8 rounded-full border-4 border-zinc-500 border-t-transparent animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Welcome Hero Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-900 border border-zinc-800 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl z-10">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700 inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-zinc-200" />
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
              className="btn-primary py-3 px-5 rounded-2xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 flex-1 md:flex-none"
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
                  <p className="text-xs text-secondary-theme font-semibold truncate max-w-xs">
                    🎯 {activeTask.title}
                  </p>
                )}
              </div>

              <Link
                href="/pomodoro"
                className="btn-secondary py-3.5 px-6 rounded-2xl text-xs shadow-md transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4 text-primary-theme fill-current" />
                <span>Ir para o Timer</span>
              </Link>
            </div>

            {/* Today's Planning Activities */}
            <div className="p-6 rounded-3xl theme-surface border backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-secondary-theme" />
                  <h3 className="text-sm font-bold text-primary-theme">Atividades de Hoje ({todayActivities.length})</h3>
                </div>
                <Link
                  href="/planejamento/diario"
                  className="text-xs font-bold text-secondary-theme hover:text-primary-theme flex items-center gap-1"
                >
                  <span>Ver todas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {todayActivities.length === 0 ? (
                <p className="text-xs text-tertiary-theme py-4 text-center">Nenhuma atividade planejada para hoje.</p>
              ) : (
                <div className="space-y-2">
                  {todayActivities.slice(0, 4).map((act) => (
                    <div
                      key={act.id}
                      className="p-3 rounded-2xl theme-card border flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          className={`w-4 h-4 ${act.isCompleted ? 'text-primary-theme' : 'text-tertiary-theme'}`}
                        />
                        <span className={`font-semibold ${act.isCompleted ? 'line-through text-tertiary-theme' : 'text-primary-theme'}`}>
                          {act.title}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-secondary-theme flex items-center gap-1">
                        <Clock className="w-3 h-3 text-secondary-theme" />
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
            <div className="p-6 rounded-3xl theme-surface border backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-secondary-theme" />
                  <h3 className="text-sm font-bold text-primary-theme">Eventos do Dia ({todayEvents.length})</h3>
                </div>
                <Link
                  href="/calendario"
                  className="text-xs font-bold text-secondary-theme hover:text-primary-theme flex items-center gap-1"
                >
                  <span>Calendário</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {todayEvents.length === 0 ? (
                <p className="text-xs text-tertiary-theme py-4 text-center">Nenhum evento no calendário hoje.</p>
              ) : (
                <div className="space-y-2">
                  {todayEvents.slice(0, 3).map((evt) => (
                    <div
                      key={evt.id}
                      className="p-3 rounded-2xl theme-card border flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-primary-theme">{evt.title}</p>
                        <p className="text-[10px] text-secondary-theme">{evt.category}</p>
                      </div>
                      <span className="font-mono text-[10px] text-primary-theme font-bold">
                        {evt.startTime} - {evt.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Reports Widget */}
            <div className="p-6 rounded-3xl theme-surface border backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-secondary-theme" />
                  <h3 className="text-sm font-bold text-primary-theme">Resumo de Produtividade</h3>
                </div>
                <Link
                  href="/relatorios"
                  className="text-xs font-bold text-secondary-theme hover:text-primary-theme flex items-center gap-1"
                >
                  <span>Relatórios</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl theme-card border">
                  <span className="text-tertiary-theme block text-[10px]">Sessões de Foco</span>
                  <span className="text-xl font-extrabold text-primary-theme font-mono">{completedSessions}</span>
                </div>

                <div className="p-3 rounded-2xl theme-card border">
                  <span className="text-tertiary-theme block text-[10px]">Tempo Total</span>
                  <span className="text-xl font-extrabold text-primary-theme font-mono">
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
