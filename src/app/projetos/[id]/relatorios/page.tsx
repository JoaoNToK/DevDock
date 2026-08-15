'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { useProjects } from '@/hooks/useProjects';
import { BarChart2, Clock, CheckCircle2, ArrowLeft, Target, Play } from 'lucide-react';

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
          <div className="w-8 h-8 rounded-full border-4 border-[var(--border-color)] border-t-[var(--text-primary)] animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (!project) {
    return (
      <MainLayout>
        <div className="p-8 text-center text-secondary-theme space-y-4">
          <p>Projeto não encontrado.</p>
          <Link href="/projetos" className="btn-primary py-2 px-4 rounded-xl text-xs inline-block">
            Voltar para Projetos
          </Link>
        </div>
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-3xl theme-surface border backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Link
              href={`/projetos/${project.id}`}
              className="p-2 rounded-2xl theme-card text-secondary-theme hover:text-primary-theme transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{project.icon || '🚀'}</span>
                <h2 className="text-xl font-extrabold text-primary-theme">Relatório de Produtividade — {project.name}</h2>
              </div>
              <p className="text-xs text-secondary-theme font-medium">Desempenho, tarefas concluídas e horas de foco no Pomodoro</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl theme-surface border space-y-1">
            <span className="text-xs font-semibold text-secondary-theme">Progresso Geral</span>
            <p className="text-3xl font-extrabold text-primary-theme font-mono">{progressPct}%</p>
            <p className="text-[10px] text-tertiary-theme">Com base nas tarefas concluídas</p>
          </div>

          <div className="p-5 rounded-3xl theme-surface border space-y-1">
            <span className="text-xs font-semibold text-secondary-theme">Tarefas Concluídas</span>
            <p className="text-3xl font-extrabold text-primary-theme font-mono">{completedTasks} / {projTasks.length}</p>
            <p className="text-[10px] text-tertiary-theme">Tarefas no quadro</p>
          </div>

          <div className="p-5 rounded-3xl theme-surface border space-y-1">
            <span className="text-xs font-semibold text-secondary-theme">Tempo Focado</span>
            <p className="text-3xl font-extrabold text-primary-theme font-mono">{hoursFocussed}h</p>
            <p className="text-[10px] text-tertiary-theme">{project.totalFocusMinutes} minutos acumulados</p>
          </div>

          <div className="p-5 rounded-3xl theme-surface border space-y-1">
            <span className="text-xs font-semibold text-secondary-theme">Sessões de Pomodoro</span>
            <p className="text-3xl font-extrabold text-primary-theme font-mono">{totalPomodoros}</p>
            <p className="text-[10px] text-tertiary-theme">Sessões registradas</p>
          </div>
        </div>

        {/* Column Distribution */}
        <div className="p-6 rounded-3xl theme-surface border space-y-4">
          <h3 className="text-sm font-bold text-primary-theme">Distribuição de Tarefas por Coluna</h3>
          <div className="space-y-3">
            {projCols.map((col) => {
              const colTasksCount = projTasks.filter((t) => t.columnId === col.id).length;
              const pct = projTasks.length > 0 ? Math.round((colTasksCount / projTasks.length) * 100) : 0;
              return (
                <div key={col.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-secondary-theme flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color || '#6366f1' }} />
                      {col.name}
                    </span>
                    <span className="font-mono text-tertiary-theme">{colTasksCount} tarefas ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full theme-card overflow-hidden border">
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

        {/* Task Focus Time Detail Breakdown */}
        <div className="p-6 rounded-3xl theme-surface border space-y-4">
          <h3 className="text-sm font-bold text-primary-theme">Detalhamento de Foco por Tarefa</h3>
          {projTasks.length === 0 ? (
            <p className="text-xs text-tertiary-theme py-4 text-center">Nenhuma tarefa criada no projeto ainda.</p>
          ) : (
            <div className="space-y-2">
              {projTasks.map((task) => {
                const taskMins = task.focusMinutes || 0;
                const taskPomo = Math.round(taskMins / 25);
                return (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-2xl theme-card-elevated border flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-primary-theme">{task.title}</p>
                      <p className="text-[10px] text-secondary-theme">
                        Prioridade: {task.priority.toUpperCase()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-primary-theme">
                        {taskMins} min ({taskPomo} sessões)
                      </span>
                      <Link
                        href={`/pomodoro?projectId=${project.id}&taskId=${task.id}`}
                        className="btn-secondary py-1 px-2.5 rounded-xl text-[10px] flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-current text-primary-theme" />
                        <span>Focar</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
