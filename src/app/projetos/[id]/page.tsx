'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { useProjects } from '@/hooks/useProjects';
import { TaskModal } from '@/components/projects/TaskModal';
import { ProjectModal } from '@/components/projects/ProjectModal';
import { ProjectTask } from '@/types/projects';
import {
  FolderKanban,
  Plus,
  Clock,
  CheckCircle2,
  ArrowRight,
  Pencil,
  FileText,
  Target,
  BookOpen,
  ArrowLeft,
} from 'lucide-react';

export default function SingleProjectDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const {
    isMounted,
    projects,
    columns,
    tasks,
    notes,
    docs,
    goals,
    getProjectProgress,
    addTask,
    updateTask,
    deleteTask,
    updateProject,
    deleteProject,
  } = useProjects();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<ProjectTask | null>(null);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const project = projects.find((p) => p.id === projectId);
  const projTasks = tasks.filter((t) => t.projectId === projectId);
  const projNotes = notes.filter((n) => n.projectId === projectId);
  const projDoc = docs.find((d) => d.projectId === projectId);
  const projGoals = goals.filter((g) => g.projectId === projectId);
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
        <div className="p-8 text-center space-y-4">
          <p className="text-zinc-400">Projeto não encontrado.</p>
          <Link
            href="/projetos"
            className="py-2 px-4 rounded-2xl bg-cyan-600 text-white font-bold text-xs inline-block"
          >
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

  const handleSaveTask = (data: Omit<ProjectTask, 'id' | 'focusMinutes' | 'createdAt'>) => {
    if (taskToEdit) {
      updateTask(taskToEdit.id, data);
    } else {
      addTask(data);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Back Link */}
        <Link
          href="/projetos"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para todos os projetos</span>
        </Link>

        {/* Project Header Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{project.icon || '🚀'}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-white">{project.name}</h1>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white uppercase"
                    style={{ backgroundColor: project.color }}
                  >
                    {project.status === 'active' ? '🟢 Ativo' : '🟡 Em Pausa'}
                  </span>
                </div>
                {project.description && (
                  <p className="text-xs text-zinc-400 mt-0.5">{project.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/pomodoro"
                className="py-2.5 px-4 rounded-2xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>▶ Iniciar Pomodoro</span>
              </Link>

              <button
                onClick={() => {
                  setTaskToEdit(null);
                  setIsTaskModalOpen(true);
                }}
                className="py-2.5 px-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Tarefa</span>
              </button>

              <button
                onClick={() => setIsProjectModalOpen(true)}
                className="p-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
            <div className="flex items-center justify-between text-xs font-bold font-mono">
              <span className="text-zinc-400">Progresso Geral do Projeto</span>
              <span className="text-cyan-400">{completedTasks}/{projTasks.length} tarefas ({progressPct}%)</span>
            </div>
            <div className="w-full h-3 rounded-full bg-zinc-950 overflow-hidden p-0.5 border border-zinc-800">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%`, backgroundColor: project.color }}
              />
            </div>
          </div>
        </div>

        {/* Quick Action Navigation Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href={`/projetos/${project.id}/kanban`}
            className="p-4 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 text-xs font-bold text-white flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-cyan-400" />
              <span>Quadro Kanban</span>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-cyan-400 transition-colors" />
          </Link>

          <Link
            href={`/projetos/${project.id}/objetivos`}
            className="p-4 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 text-xs font-bold text-white flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>Objetivos ({projGoals.length})</span>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
          </Link>

          <Link
            href={`/projetos/${project.id}/notas`}
            className="p-4 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 text-xs font-bold text-white flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Notas ({projNotes.length})</span>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
          </Link>

          <Link
            href={`/projetos/${project.id}/documentacao`}
            className="p-4 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 text-xs font-bold text-white flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>Documentação</span>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-purple-400 transition-colors" />
          </Link>
        </div>

        {/* 2 Column Section: Tasks Overview vs Goals & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Tasks Overview (Left) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-cyan-400" />
                  <span>📌 Tarefas no Kanban ({projTasks.length})</span>
                </h3>
                <Link
                  href={`/projetos/${project.id}/kanban`}
                  className="text-xs font-bold text-cyan-400 hover:underline"
                >
                  Abrir Quadro Kanban
                </Link>
              </div>

              {projTasks.length === 0 ? (
                <p className="text-xs text-zinc-500 py-6 text-center">Nenhuma tarefa criada no projeto.</p>
              ) : (
                <div className="space-y-2.5">
                  {projTasks.slice(0, 4).map((t) => {
                    const col = projCols.find((c) => c.id === t.columnId);
                    return (
                      <div
                        key={t.id}
                        className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold text-white mb-1 inline-block"
                            style={{ backgroundColor: col?.color || '#6366f1' }}
                          >
                            {col?.name || 'A Fazer'}
                          </span>
                          <h4 className="font-bold text-white text-sm">{t.title}</h4>
                        </div>

                        <span className="font-mono text-[11px] text-zinc-400">{t.dueDate || 'Sem prazo'}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Goals & Stats (Right) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span>Objetivos &amp; Milestones ({projGoals.length})</span>
                </h3>
                <Link
                  href={`/projetos/${project.id}/objetivos`}
                  className="text-xs font-bold text-cyan-400 hover:underline"
                >
                  Gerenciar
                </Link>
              </div>

              {projGoals.length === 0 ? (
                <p className="text-xs text-zinc-500 py-4 text-center">Nenhum objetivo configurado.</p>
              ) : (
                <div className="space-y-3">
                  {projGoals.map((g) => (
                    <div key={g.id} className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-white truncate">{g.title}</span>
                        <span className="text-emerald-400 font-mono">{g.progressPct}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${g.progressPct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
        <TaskModal
          isOpen={isTaskModalOpen}
          taskToEdit={taskToEdit}
          columns={projCols}
          projectId={project.id}
          onClose={() => setIsTaskModalOpen(false)}
          onSave={handleSaveTask}
          onDelete={deleteTask}
        />

        <ProjectModal
          isOpen={isProjectModalOpen}
          projectToEdit={project}
          onClose={() => setIsProjectModalOpen(false)}
          onSave={(data) => updateProject(project.id, data)}
          onDelete={deleteProject}
        />
      </div>
    </MainLayout>
  );
}
