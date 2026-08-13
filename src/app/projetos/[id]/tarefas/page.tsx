'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { useProjects } from '@/hooks/useProjects';
import { TaskModal } from '@/components/projects/TaskModal';
import { ProjectTask, ProjectPriority } from '@/types/projects';
import { CheckSquare, Plus, Pencil, Trash2, Clock, ArrowLeft } from 'lucide-react';

export default function ProjectTasksPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const {
    isMounted,
    projects,
    columns,
    tasks,
    addTask,
    updateTask,
    deleteTask,
  } = useProjects();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<ProjectTask | null>(null);

  const project = projects.find((p) => p.id === projectId);
  const projCols = columns.filter((c) => c.projectId === projectId);
  const projTasks = tasks.filter((t) => t.projectId === projectId);

  const handleOpenAdd = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: ProjectTask) => {
    setTaskToEdit(t);
    setIsModalOpen(true);
  };

  const handleSaveModal = (data: Omit<ProjectTask, 'id' | 'focusMinutes' | 'createdAt'>) => {
    if (taskToEdit) {
      updateTask(taskToEdit.id, data);
    } else {
      addTask(data);
    }
  };

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
              <h2 className="text-xl font-extrabold text-white">Tarefas — {project.name}</h2>
              <p className="text-xs text-zinc-400 font-medium">Lista completa de tarefas, subtarefas e prazos</p>
            </div>
          </div>

          <button
            onClick={handleOpenAdd}
            className="py-2.5 px-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Tarefa</span>
          </button>
        </div>

        {/* Tasks List */}
        {projTasks.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500 bg-zinc-900/40 rounded-3xl border border-zinc-800">
            Nenhuma tarefa criada no projeto.
          </div>
        ) : (
          <div className="space-y-3">
            {projTasks.map((t) => {
              const col = projCols.find((c) => c.id === t.columnId);
              return (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase"
                      style={{ backgroundColor: col?.color || '#6366f1' }}
                    >
                      {col?.name || 'A Fazer'}
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm">{t.title}</h4>
                      {t.description && (
                        <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">{t.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-zinc-400 font-mono text-[11px] w-full sm:w-auto justify-end">
                    {t.dueDate && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        {t.dueDate}
                      </span>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(t)}
                        className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTask(t.id)}
                        className="p-1.5 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-zinc-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <TaskModal
          isOpen={isModalOpen}
          taskToEdit={taskToEdit}
          columns={projCols}
          projectId={project.id}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveModal}
          onDelete={deleteTask}
        />
      </div>
    </MainLayout>
  );
}
