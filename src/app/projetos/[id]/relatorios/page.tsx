'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { useProjects } from '@/hooks/useProjects';
import { BarChart2, Clock, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ProjectReportsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const { isMounted, projects, columns, tasks, getProjectProgress } = useProjects();

  const project = projects.find((p) => p.id === projectId);
  const projTasks = tasks.filter((t) => t.projectId === projectId);
  const projCols = columns.filter((c) => c.projectId === projectId);

  if (!isMounted) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="w-8 h-8 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (!project) {
    return (
      <MainLayout>
        <div className="p-8 text-center text-zinc-400">Projeto não encontrado.</div>
      </MainLayout>
    );
  }

  const progressPct = getProjectProgress(project.id);
  const completedTasks = projTasks.filter((t) => {
    const doneCol = projCols.find((c) => c.id === t.columnId && c.name.toUpperCase() === 'CONCLUÍDO');
    return doneCol || t.completedAt;
  }).length;
  const hoursFocussed = (project.totalFocusMinutes / 60).toFixed(1);
  const totalPomodoros = Math.round(project.totalFocusMinutes / 25);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Link
              href={`/projetos/${project.id}`}
              className="p-2 rounded-2xl bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h2 className="text-xl font-extrabold text-white">Relatório de Produtividade — {project.name}</h2>
              <p className="text-xs text-zinc-400 font-medium">Desempenho, tarefas concluídas e horas de foco no Pomodoro</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-1">
            <span className="text-xs font-semibold text-cyan-400">Progresso Geral</span>
            <p className="text-3xl font-extrabold text-white font-mono">{progressPct}%</p>
            <p className="text-[10px] text-zinc-500">Com base nas tarefas concluídas</p>
          </div>

          <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-1">
            <span className="text-xs font-semibold text-emerald-400">Tarefas Concluídas</span>
            <p className="text-3xl font-extrabold text-white font-mono">{completedTasks} / {projTasks.length}</p>
            <p className="text-[10px] text-zinc-500">Tarefas no quadro</p>
          </div>

          <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-1">
            <span className="text-xs font-semibold text-indigo-400">Tempo Focado</span>
            <p className="text-3xl font-extrabold text-white font-mono">{hoursFocussed}h</p>
            <p className="text-[10px] text-zinc-500">{project.totalFocusMinutes} minutos acumulados</p>
          </div>

          <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-1">
            <span className="text-xs font-semibold text-amber-400">Sessões de Pomodoro</span>
            <p className="text-3xl font-extrabold text-white font-mono">🍅 {totalPomodoros}</p>
            <p className="text-[10px] text-zinc-500">Sessões dedicadas</p>
          </div>
        </div>

        {/* Visual Progress Bar Breakdown */}
        <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4">
          <h3 className="text-sm font-bold text-white">Distribuição de Tarefas por Coluna</h3>
          <div className="space-y-3">
            {projCols.map((col) => {
              const colTasksCount = projTasks.filter((t) => t.columnId === col.id).length;
              const pct = projTasks.length > 0 ? Math.round((colTasksCount / projTasks.length) * 100) : 0;
              return (
                <div key={col.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-zinc-300 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color || '#6366f1' }} />
                      {col.name}
                    </span>
                    <span className="font-mono text-zinc-400">{colTasksCount} tarefas ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: col.color || '#6366f1' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
