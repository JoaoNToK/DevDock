'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { useProjects } from '@/hooks/useProjects';
import { TaskModal } from '@/components/projects/TaskModal';
import { ProjectTask } from '@/types/projects';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Clock,
  ArrowLeft,
} from 'lucide-react';

export default function KanbanBoardPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const {
    isMounted,
    projects,
    columns,
    tasks,
    addColumn,
    deleteColumn,
    addTask,
    updateTask,
    moveTaskColumn,
    deleteTask,
  } = useProjects();

  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [newColumnName, setNewColumnName] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<ProjectTask | null>(null);
  const [targetColumnId, setTargetColumnId] = useState<string>('');

  const project = projects.find((p) => p.id === projectId);
  const projCols = columns.filter((c) => c.projectId === projectId).sort((a, b) => a.order - b.order);
  const projTasks = tasks.filter((t) => t.projectId === projectId);

  const filteredTasks = projTasks.filter((t) => {
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = t.title.toLowerCase().includes(q);
      const tagMatch = t.tags && t.tags.some((tag) => tag.toLowerCase().includes(q));
      if (!titleMatch && !tagMatch) return false;
    }
    return true;
  });

  const handleAddColumnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnName.trim()) return;
    addColumn(projectId, newColumnName.trim());
    setNewColumnName('');
    setIsAddingColumn(false);
  };

  const handleOpenAddTask = (colId: string) => {
    setTaskToEdit(null);
    setTargetColumnId(colId);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (t: ProjectTask) => {
    setTaskToEdit(t);
    setTargetColumnId(t.columnId);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (data: Omit<ProjectTask, 'id' | 'focusMinutes' | 'createdAt'>) => {
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
        <div className="p-8 text-center text-zinc-400">
          <p>Projeto não encontrado.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header & Back Link */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Link
              href={`/projetos/${project.id}`}
              className="p-2 rounded-2xl bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{project.icon || '🚀'}</span>
                <h2 className="text-xl font-extrabold text-white">Quadro Kanban — {project.name}</h2>
              </div>
              <p className="text-xs text-zinc-400 font-medium">Arraste tarefas e gerencie etapas com colunas personalizáveis</p>
            </div>
          </div>

          <button
            onClick={() => handleOpenAddTask(projCols[0]?.id || '')}
            className="py-2.5 px-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nova Tarefa</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold">
          <div className="relative w-full sm:w-72 flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Filtrar tarefas no Kanban por título ou #tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2.5 pl-10 pr-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Filter className="w-4 h-4 text-cyan-400" />
              <span>Prioridade:</span>
            </div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="py-2 px-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">Todas as Prioridades</option>
              <option value="urgent">🔴 Urgente</option>
              <option value="high">🟠 Alta</option>
              <option value="medium">🟡 Média</option>
              <option value="low">🟢 Baixa</option>
            </select>
          </div>
        </div>

        {/* Kanban Horizontal Board Container */}
        <div className="flex gap-4 overflow-x-auto pb-6 pt-2 items-start snap-x">
          {projCols.map((col, colIdx) => {
            const colTasks = filteredTasks.filter((t) => t.columnId === col.id);

            return (
              <div
                key={col.id}
                className="w-80 min-w-[300px] rounded-3xl bg-zinc-900/90 border border-zinc-800/90 backdrop-blur-xl p-4 space-y-3 flex-shrink-0 flex flex-col justify-between"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: col.color || '#6366f1' }} />
                    <h3 className="font-extrabold text-xs tracking-wider text-white uppercase">{col.name}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] font-mono text-zinc-300 font-bold">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenAddTask(col.id)}
                      className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    {projCols.length > 1 && (
                      <button
                        onClick={() => deleteColumn(col.id)}
                        className="p-1 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Column Task Cards Stack */}
                <div className="space-y-2.5 min-h-[150px]">
                  {colTasks.length === 0 ? (
                    <div className="p-4 text-center text-[11px] text-zinc-600 border border-dashed border-zinc-800/60 rounded-2xl">
                      Nenhuma tarefa nesta coluna.
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const completedChk = task.checklist ? task.checklist.filter((i) => i.isCompleted).length : 0;
                      return (
                        <div
                          key={task.id}
                          className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-all space-y-2 text-xs shadow-md group cursor-pointer"
                          onClick={() => handleOpenEditTask(task)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors leading-snug">
                              {task.title}
                            </h4>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase flex-shrink-0 ${
                                task.priority === 'urgent'
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                  : task.priority === 'high'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-zinc-800 text-zinc-300'
                              }`}
                            >
                              {task.priority === 'urgent' ? '🔴 Urgente' : task.priority === 'high' ? 'Alta' : 'Normal'}
                            </span>
                          </div>

                          {task.description && (
                            <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{task.description}</p>
                          )}

                          {/* Tags & Checklist badge */}
                          <div className="flex flex-wrap items-center justify-between gap-1 pt-1 border-t border-zinc-900 text-[10px]">
                            {task.checklist && task.checklist.length > 0 ? (
                              <span className="flex items-center gap-1 text-emerald-400 font-mono">
                                <CheckSquare className="w-3 h-3" />
                                {completedChk}/{task.checklist.length}
                              </span>
                            ) : null}

                            {task.dueDate ? (
                              <span className="flex items-center gap-1 text-zinc-400 font-mono">
                                <Clock className="w-3 h-3 text-cyan-400" />
                                {task.dueDate}
                              </span>
                            ) : null}
                          </div>

                          {/* Accessible Column Shift Buttons */}
                          <div
                            className="flex items-center justify-between pt-2 border-t border-zinc-900/80"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              disabled={colIdx === 0}
                              onClick={() => moveTaskColumn(task.id, projCols[colIdx - 1].id)}
                              className="p-1 rounded-lg text-zinc-500 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-500"
                              title="Mover para esquerda"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>

                            <select
                              value={task.columnId}
                              onChange={(e) => moveTaskColumn(task.id, e.target.value)}
                              className="py-0.5 px-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300 font-bold focus:outline-none"
                            >
                              {projCols.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name}
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              disabled={colIdx === projCols.length - 1}
                              onClick={() => moveTaskColumn(task.id, projCols[colIdx + 1].id)}
                              className="p-1 rounded-lg text-zinc-500 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-500"
                              title="Mover para direita"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenAddTask(col.id)}
                  className="w-full py-2 px-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 mt-3"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Tarefa</span>
                </button>
              </div>
            );
          })}

          {/* Add Column Button / Form */}
          <div className="w-72 min-w-[280px] flex-shrink-0">
            {isAddingColumn ? (
              <form onSubmit={handleAddColumnSubmit} className="p-4 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Nome da Coluna ex: REVISÃO..."
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 px-3 rounded-xl bg-cyan-600 text-white font-bold text-xs"
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingColumn(false)}
                    className="py-2 px-3 rounded-xl bg-zinc-800 text-zinc-400 font-bold text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingColumn(true)}
                className="w-full p-4 rounded-3xl bg-zinc-900/40 hover:bg-zinc-900 border border-dashed border-zinc-800 text-zinc-400 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>+ Adicionar Coluna</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal */}
        <TaskModal
          isOpen={isTaskModalOpen}
          taskToEdit={taskToEdit}
          columns={projCols}
          defaultColumnId={targetColumnId}
          projectId={project.id}
          onClose={() => setIsTaskModalOpen(false)}
          onSave={handleSaveTask}
          onDelete={deleteTask}
        />
      </div>
    </MainLayout>
  );
}
