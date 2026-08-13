'use client';

import React from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { useStudies } from '@/hooks/useStudies';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  Trophy,
  Target,
  ArrowRight,
  Flame,
  Plus,
} from 'lucide-react';

export default function EstudosDashboardPage() {
  const {
    isMounted,
    subjects,
    topics,
    notes,
    goals,
    getSubjectProgress,
  } = useStudies();

  if (!isMounted) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="w-8 h-8 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      </MainLayout>
    );
  }

  const totalTimeMinutes = subjects.reduce((sum, s) => sum + s.totalTimeMinutes, 0);
  const totalHoursStr = (totalTimeMinutes / 60).toFixed(1);
  const completedTopicsCount = topics.filter((t) => t.status === 'completed').length;
  const inProgressTopics = topics.filter((t) => t.status === 'in_progress');

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Banner Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/80 via-zinc-900 to-zinc-900 border border-indigo-500/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl z-10">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 inline-flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-indigo-400" />
              <span>Gerenciador Pessoal de Aprendizado</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Painel Geral de Estudos
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Organize suas matérias, acompanhe o progresso automático de conteúdos e faça revisões programadas.
            </p>
          </div>

          <Link
            href="/estudos/materias"
            className="py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 z-10"
          >
            <Plus className="w-4 h-4" />
            <span>Gerenciar Matérias</span>
          </Link>
        </div>

        {/* 3 Stats Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-1">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
              <BookOpen className="w-4 h-4" />
              <span>Matérias Ativas</span>
            </div>
            <p className="text-3xl font-extrabold text-white font-mono">{subjects.length}</p>
            <p className="text-[10px] text-zinc-500">Disciplinas em acompanhamento</p>
          </div>

          <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <Clock className="w-4 h-4" />
              <span>Tempo Estudado</span>
            </div>
            <p className="text-3xl font-extrabold text-white font-mono">{totalHoursStr}h</p>
            <p className="text-[10px] text-zinc-500">{totalTimeMinutes} minutos acumulados</p>
          </div>

          <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-1">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Conteúdos Concluídos</span>
            </div>
            <p className="text-3xl font-extrabold text-white font-mono">
              {completedTopicsCount} / {topics.length}
            </p>
            <p className="text-[10px] text-zinc-500">
              {topics.length > 0 ? Math.round((completedTopicsCount / topics.length) * 100) : 0}% de conclusão total
            </p>
          </div>
        </div>

        {/* Main 2-Column Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Continue Estudando & Matérias Overview */}
          <div className="lg:col-span-7 space-y-6">
            {/* Continue Estudando */}
            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Continue Estudando (Em andamento)</h3>
                </div>
                <Link
                  href="/estudos/conteudos"
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <span>Ver todos</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {inProgressTopics.length === 0 ? (
                <p className="text-xs text-zinc-500 py-4 text-center">Nenhum conteúdo em andamento no momento.</p>
              ) : (
                <div className="space-y-2.5">
                  {inProgressTopics.map((top) => {
                    const sub = subjects.find((s) => s.id === top.subjectId);
                    return (
                      <div
                        key={top.id}
                        className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white mb-1 inline-block"
                            style={{ backgroundColor: sub?.color || '#6366f1' }}
                          >
                            {sub?.name || 'Geral'}
                          </span>
                          <h4 className="font-bold text-white text-sm">→ {top.title}</h4>
                        </div>

                        <Link
                          href="/pomodoro"
                          className="py-1.5 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1 transition-all"
                        >
                          <span>Focar no Timer</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Matérias Overview Progress */}
            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Progresso por Matéria</h3>
                <Link
                  href="/estudos/materias"
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <span>Ver Matérias</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-4">
                {subjects.map((sub) => {
                  const pct = getSubjectProgress(sub.id);
                  const subTopics = topics.filter((t) => t.subjectId === sub.id);
                  const completed = subTopics.filter((t) => t.status === 'completed').length;

                  return (
                    <div key={sub.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-white flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: sub.color }} />
                          {sub.name}
                        </span>
                        <span className="font-mono text-zinc-400">
                          {completed}/{subTopics.length} ({pct}%)
                        </span>
                      </div>

                      <div className="w-full h-2.5 rounded-full bg-zinc-950 overflow-hidden p-0.5 border border-zinc-800">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: sub.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Metas de Estudo & Anotações Recentes */}
          <div className="lg:col-span-5 space-y-6">
            {/* Metas de Estudo */}
            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Metas de Aprendizado</h3>
                </div>
                <Link
                  href="/estudos/metas"
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <span>Gerenciar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {goals.length === 0 ? (
                <p className="text-xs text-zinc-500 py-4 text-center">Nenhuma meta configurada ainda.</p>
              ) : (
                <div className="space-y-3">
                  {goals.map((goal) => {
                    const pct = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
                    return (
                      <div key={goal.id} className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-white truncate max-w-[200px]">{goal.title}</span>
                          <span className="text-emerald-400 font-mono">{pct}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Anotações Recentes */}
            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Anotações Recentes ({notes.length})</h3>
                <Link
                  href="/estudos/anotacoes"
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <span>Abrir Notas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-2">
                {notes.slice(0, 3).map((note) => (
                  <div key={note.id} className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 text-xs space-y-1">
                    <p className="font-bold text-white truncate">
                      {note.isPinned && '📌 '}
                      {note.title}
                    </p>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{note.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
