'use client';

import React, { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { usePomodoroTimer } from '@/hooks/usePomodoroTimer';
import { useProjects } from '@/hooks/useProjects';
import { useCategories } from '@/hooks/useCategories';
import { Task, Subtask } from '@/types/task';
import { getTodayYMD } from '@/lib/date';
import {
  CheckSquare,
  Plus,
  Calendar,
  CheckCircle2,
  Circle,
  Star,
  Tag,
  FolderKanban,
  Trash2,
  Play,
  ChevronDown,
  ChevronRight,
  Clock,
} from 'lucide-react';

type TaskFilterList = 'all' | 'today' | 'upcoming' | 'completed' | 'starred';

export default function TarefasPage() {
  const {
    isMounted,
    tasks,
    activeTaskId,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    setActiveTask,
  } = usePomodoroTimer();

  const { projects } = useProjects();
  const { categories } = useCategories();

  const [activeList, setActiveList] = useState<TaskFilterList>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('');

  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDueDate, setNewDueDate] = useState(getTodayYMD());
  const [newCategory, setNewCategory] = useState('geral');
  const [newProjectId, setNewProjectId] = useState('');
  const [newSubtasks, setNewSubtasks] = useState<string[]>([]);
  const [subtaskInput, setSubtaskInput] = useState('');

  const todayStr = getTodayYMD();

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (selectedCategoryFilter && t.category !== selectedCategoryFilter) return false;
      if (selectedProjectFilter && t.projectId !== selectedProjectFilter) return false;

      if (activeList === 'today') return t.dateString === todayStr && !t.isCompleted;
      if (activeList === 'upcoming') return t.dateString > todayStr && !t.isCompleted;
      if (activeList === 'completed') return t.isCompleted;
      if (activeList === 'starred') return t.isStarred && !t.isCompleted;

      return !t.isCompleted;
    });
  }, [tasks, activeList, selectedCategoryFilter, selectedProjectFilter, todayStr]);

  const handleAddSubtaskInput = () => {
    if (!subtaskInput.trim()) return;
    setNewSubtasks((prev) => [...prev, subtaskInput.trim()]);
    setSubtaskInput('');
  };

  const handleRemoveSubtaskInput = (idx: number) => {
    setNewSubtasks((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const subtasksToSave: Subtask[] = newSubtasks.map((st, i) => ({
      id: `st-${Date.now()}-${i}`,
      title: st,
      isCompleted: false,
    }));

    addTask({
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      subtasks: subtasksToSave.length > 0 ? subtasksToSave : undefined,
      category: newCategory as any,
      priority: 'medium',
      tags: [],
      estimatedPomodoros: 1,
      dateString: newDueDate || todayStr,
      projectId: newProjectId || undefined,
    });

    setNewTitle('');
    setNewDesc('');
    setNewSubtasks([]);
    setSubtaskInput('');
    setIsCreating(false);
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask || !targetTask.subtasks) return;

    const updatedSubtasks = targetTask.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
    );

    updateTask(taskId, { subtasks: updatedSubtasks });
  };

  const handleToggleStar = (taskId: string) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;
    updateTask(taskId, { isStarred: !targetTask.isStarred });
  };

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
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-3xl theme-surface border backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl theme-card-elevated border text-primary-theme">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-primary-theme">Minhas Tarefas</h2>
              <p className="text-xs text-secondary-theme font-medium">
                Gerenciador autônomo estilo Google Tasks integrado ao Calendário e Kanban
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCreating(true)}
            className="py-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Adicionar uma tarefa</span>
          </button>
        </div>

        {/* 2 Column Layout: Task Lists Sidebar vs Task Items */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Lists Navigation (Left) */}
          <div className="lg:col-span-4 p-4 sm:p-5 rounded-3xl theme-surface border backdrop-blur-xl space-y-4">
            <h3 className="text-xs font-bold text-secondary-theme uppercase tracking-wider px-2">
              Listas de Tarefas
            </h3>

            <div className="space-y-1">
              {[
                { key: 'all', label: 'Todas as Tarefas', icon: CheckSquare, count: tasks.filter((t) => !t.isCompleted).length },
                { key: 'today', label: 'Para Hoje', icon: Clock, count: tasks.filter((t) => t.dateString === todayStr && !t.isCompleted).length },
                { key: 'upcoming', label: 'Próximas', icon: Calendar, count: tasks.filter((t) => t.dateString > todayStr && !t.isCompleted).length },
                { key: 'starred', label: 'Com Estrela', icon: Star, count: tasks.filter((t) => t.isStarred && !t.isCompleted).length },
                { key: 'completed', label: 'Concluídas', icon: CheckCircle2, count: tasks.filter((t) => t.isCompleted).length },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeList === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      setActiveList(item.key as TaskFilterList);
                      setSelectedCategoryFilter('');
                      setSelectedProjectFilter('');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                      isActive
                        ? 'theme-card-elevated text-primary-theme border shadow-sm'
                        : 'text-secondary-theme hover:text-primary-theme hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full theme-surface border">
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Filter by Category */}
            <div className="pt-3 border-t border-zinc-800 space-y-2">
              <h4 className="text-[11px] font-bold text-secondary-theme uppercase tracking-wider px-2 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                <span>Filtrar por Categoria</span>
              </h4>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="w-full py-2 px-3 rounded-2xl theme-surface border text-xs text-primary-theme focus:outline-none"
              >
                <option value="">Todas as categorias</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name.toLowerCase()}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Project */}
            <div className="pt-2 border-t border-zinc-800 space-y-2">
              <h4 className="text-[11px] font-bold text-secondary-theme uppercase tracking-wider px-2 flex items-center gap-1">
                <FolderKanban className="w-3 h-3" />
                <span>Filtrar por Projeto</span>
              </h4>
              <select
                value={selectedProjectFilter}
                onChange={(e) => setSelectedProjectFilter(e.target.value)}
                className="w-full py-2 px-3 rounded-2xl theme-surface border text-xs text-primary-theme focus:outline-none"
              >
                <option value="">Todos os projetos</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.icon} {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Main Task List (Right) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Quick Creation Card */}
            {isCreating && (
              <form onSubmit={handleCreateTaskSubmit} className="p-5 rounded-3xl theme-surface border space-y-4 shadow-xl animate-fade-in">
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="Adicionar uma tarefa..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-transparent font-bold text-base text-primary-theme focus:outline-none placeholder:text-tertiary-theme"
                    autoFocus
                  />
                  <textarea
                    rows={2}
                    placeholder="Adicionar detalhes..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full bg-transparent text-xs text-primary-theme focus:outline-none resize-none placeholder:text-tertiary-theme font-mono"
                  />
                </div>

                {/* Subtasks Builder */}
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <label className="text-[11px] font-bold text-secondary-theme uppercase block">
                    Subtarefas
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Adicionar subtarefa..."
                      value={subtaskInput}
                      onChange={(e) => setSubtaskInput(e.target.value)}
                      className="flex-1 py-1.5 px-3 rounded-xl theme-surface border text-xs text-primary-theme focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddSubtaskInput}
                      className="py-1.5 px-3 rounded-xl theme-card-elevated border text-xs font-bold text-primary-theme"
                    >
                      + Subtarefa
                    </button>
                  </div>

                  {newSubtasks.length > 0 && (
                    <div className="space-y-1 pl-2 border-l-2 border-zinc-800">
                      {newSubtasks.map((st, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-secondary-theme">
                          <span>• {st}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubtaskInput(idx)}
                            className="text-tertiary-theme hover:text-red-400"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-zinc-800 text-xs">
                  <div>
                    <label className="text-[10px] text-secondary-theme block mb-1 font-bold uppercase">Data</label>
                    <input
                      type="date"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="w-full py-1.5 px-2 rounded-xl theme-surface border text-xs text-primary-theme"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-secondary-theme block mb-1 font-bold uppercase">Categoria</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full py-1.5 px-2 rounded-xl theme-surface border text-xs text-primary-theme"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name.toLowerCase()}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-secondary-theme block mb-1 font-bold uppercase">Projeto</label>
                    <select
                      value={newProjectId}
                      onChange={(e) => setNewProjectId(e.target.value)}
                      className="w-full py-1.5 px-2 rounded-xl theme-surface border text-xs text-primary-theme"
                    >
                      <option value="">Nenhum projeto</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="py-1.5 px-4 rounded-xl text-xs font-bold text-secondary-theme"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="py-1.5 px-5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md"
                  >
                    Salvar Tarefa
                  </button>
                </div>
              </form>
            )}

            {/* Task Items List */}
            {filteredTasks.length === 0 ? (
              <div className="p-12 text-center text-xs text-secondary-theme theme-surface rounded-3xl border">
                Nenhuma tarefa nesta lista.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((t) => {
                  const proj = projects.find((p) => p.id === t.projectId);

                  return (
                    <div
                      key={t.id}
                      className="p-4 rounded-3xl theme-surface border hover:border-zinc-700 transition-all space-y-3 group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <button
                            onClick={() => toggleTaskComplete(t.id)}
                            className="mt-0.5 text-secondary-theme hover:text-indigo-400 transition-colors"
                          >
                            {t.isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>

                          <div className="min-w-0 space-y-1">
                            <h4
                              className={`text-sm font-bold text-primary-theme ${
                                t.isCompleted ? 'line-through text-tertiary-theme' : ''
                              }`}
                            >
                              {t.title}
                            </h4>
                            {t.description && (
                              <p className="text-xs text-secondary-theme leading-relaxed">
                                {t.description}
                              </p>
                            )}

                            {/* Tags / Badges */}
                            <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-mono">
                              <span className="px-2 py-0.5 rounded-lg theme-card-elevated border text-secondary-theme capitalize">
                                {t.category}
                              </span>

                              {t.dateString && (
                                <span className="px-2 py-0.5 rounded-lg theme-card-elevated border text-indigo-400 flex items-center gap-1">
                                  <Calendar className="w-2.5 h-2.5" />
                                  <span>{t.dateString}</span>
                                </span>
                              )}

                              {proj && (
                                <span className="px-2 py-0.5 rounded-lg theme-card-elevated border text-cyan-400 flex items-center gap-1">
                                  <FolderKanban className="w-2.5 h-2.5" />
                                  <span>{proj.name}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleToggleStar(t.id)}
                            className={`p-1.5 rounded-xl transition-colors ${
                              t.isStarred ? 'text-amber-400' : 'text-tertiary-theme hover:text-white'
                            }`}
                          >
                            <Star className={`w-4 h-4 ${t.isStarred ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            onClick={() => deleteTask(t.id)}
                            className="p-1.5 rounded-xl text-tertiary-theme hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Subtasks List */}
                      {t.subtasks && t.subtasks.length > 0 && (
                        <div className="pl-8 space-y-1.5 pt-2 border-t border-zinc-800/60">
                          {t.subtasks.map((st) => (
                            <div
                              key={st.id}
                              onClick={() => handleToggleSubtask(t.id, st.id)}
                              className="flex items-center gap-2 text-xs text-secondary-theme cursor-pointer hover:text-primary-theme"
                            >
                              {st.isCompleted ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Circle className="w-3.5 h-3.5 text-tertiary-theme" />
                              )}
                              <span className={st.isCompleted ? 'line-through text-tertiary-theme' : ''}>
                                {st.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
