'use client';

import React, { useState, useMemo, use } from 'react';
import Link from 'next/link';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { MainLayout } from '@/components/layout/MainLayout';
import { useProjects } from '@/hooks/useProjects';
import { TaskModal } from '@/components/projects/TaskModal';
import { ProjectTask } from '@/types/projects';
import { KanbanColumnContainer } from '@/components/kanban/KanbanColumnContainer';
import {
  Plus,
  Search,
  Filter,
  ArrowLeft,
  X,
  RotateCcw,
  CheckCircle2,
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
    reorderTasksInColumn,
    deleteTask,
  } = useProjects();

  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [newColumnName, setNewColumnName] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<ProjectTask | null>(null);
  const [targetColumnId, setTargetColumnId] = useState<string>('');

  const [activeTask, setActiveTask] = useState<ProjectTask | null>(null);

  // Configure Sensors (Pointer, Touch & Keyboard for Accessibility)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
    useSensor(KeyboardSensor)
  );

  const project = useMemo(() => projects.find((p) => p.id === projectId), [projects, projectId]);

  const projCols = useMemo(() => {
    return columns.filter((c) => c.projectId === projectId).sort((a, b) => a.order - b.order);
  }, [columns, projectId]);

  const projTasks = useMemo(() => {
    return tasks
      .filter((t) => t.projectId === projectId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [tasks, projectId]);

  // Extract unique tags for filter dropdown
  const allTags = useMemo(() => {
    const set = new Set<string>();
    projTasks.forEach((t) => t.tags?.forEach((tag) => set.add(tag)));
    return Array.from(set);
  }, [projTasks]);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return projTasks.filter((t) => {
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      if (tagFilter !== 'all' && (!t.tags || !t.tags.includes(tagFilter))) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = t.title.toLowerCase().includes(q);
        const descMatch = t.description && t.description.toLowerCase().includes(q);
        const tagMatch = t.tags && t.tags.some((tag) => tag.toLowerCase().includes(q));
        if (!titleMatch && !descMatch && !tagMatch) return false;
      }
      return true;
    });
  }, [projTasks, priorityFilter, tagFilter, searchQuery]);

  const hasActiveFilters = priorityFilter !== 'all' || tagFilter !== 'all' || searchQuery.trim().length > 0;

  const handleClearFilters = () => {
    setSearchQuery('');
    setPriorityFilter('all');
    setTagFilter('all');
  };

  // Drag Handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = projTasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeItem = projTasks.find((t) => t.id === activeId);
    if (!activeItem) return;

    // Check if dragging over a column container directly
    const isOverAColumn = projCols.some((c) => c.id === overId);
    if (isOverAColumn) {
      if (activeItem.columnId !== overId) {
        moveTaskColumn(activeId, overId);
      }
      return;
    }

    // Dragging over another task
    const overItem = projTasks.find((t) => t.id === overId);
    if (overItem && activeItem.columnId !== overItem.columnId) {
      moveTaskColumn(activeId, overItem.columnId);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeItem = projTasks.find((t) => t.id === activeId);
    const overItem = projTasks.find((t) => t.id === overId);

    if (!activeItem) return;

    // Reordering within the same column
    if (overItem && activeItem.columnId === overItem.columnId) {
      const colTasks = projTasks.filter((t) => t.columnId === activeItem.columnId);
      const oldIndex = colTasks.findIndex((t) => t.id === activeId);
      const newIndex = colTasks.findIndex((t) => t.id === overId);

      if (oldIndex !== newIndex && oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(colTasks, oldIndex, newIndex);
        reorderTasksInColumn(
          activeItem.columnId,
          reordered.map((t) => t.id)
        );
      }
    }
  };

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

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header & Navigation */}
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
                <h2 className="text-xl font-extrabold text-primary-theme">Quadro Kanban — {project.name}</h2>
              </div>
              <p className="text-xs text-secondary-theme font-medium">
                Arraste cartões entre colunas, reordene etapas e inicie sessões de foco diretamente nas tarefas
              </p>
            </div>
          </div>

          <button
            onClick={() => handleOpenAddTask(projCols[0]?.id || '')}
            className="btn-primary py-2.5 px-4 rounded-2xl text-xs font-bold shadow-lg flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nova Tarefa</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-3xl theme-surface border backdrop-blur-xl space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold">
            {/* Search Input */}
            <div className="relative w-full sm:w-80 flex items-center">
              <Search className="w-4 h-4 absolute left-3.5 text-secondary-theme" />
              <input
                type="text"
                placeholder="Buscar por título, descrição ou #tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2.5 pl-10 pr-9 rounded-2xl theme-card border text-primary-theme placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[var(--border-color)] text-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-tertiary-theme hover:text-primary-theme"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown Filters & Counter */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
              <div className="flex items-center gap-1.5 text-secondary-theme">
                <Filter className="w-4 h-4 text-primary-theme" />
                <span>Prioridade:</span>
              </div>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="py-2 px-3 rounded-2xl theme-card border text-primary-theme text-xs focus:outline-none"
              >
                <option value="all">Todas as Prioridades</option>
                <option value="urgent">🔴 Urgente</option>
                <option value="high">🟠 Alta</option>
                <option value="medium">🟡 Média</option>
                <option value="low">🟢 Baixa</option>
              </select>

              {allTags.length > 0 && (
                <select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="py-2 px-3 rounded-2xl theme-card border text-primary-theme text-xs focus:outline-none"
                >
                  <option value="all">Todas as Tags</option>
                  {allTags.map((tag) => (
                    <option key={tag} value={tag}>
                      #{tag}
                    </option>
                  ))}
                </select>
              )}

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="btn-secondary py-2 px-3 rounded-2xl text-xs flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Limpar Filtros</span>
                </button>
              )}
            </div>
          </div>

          {/* Results Summary Counter */}
          <div className="flex items-center justify-between text-[11px] text-secondary-theme border-t pt-2">
            <span>
              Exibindo <strong className="text-primary-theme">{filteredTasks.length}</strong> de{' '}
              <strong className="text-primary-theme">{projTasks.length}</strong> tarefas no quadro
            </span>
            {hasActiveFilters && <span className="text-tertiary-theme">Filtros ativos aplicados</span>}
          </div>
        </div>

        {/* DndContext Board */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-6 pt-2 items-start snap-x">
            {projCols.map((col, colIdx) => {
              const colTasks = filteredTasks.filter((t) => t.columnId === col.id);

              return (
                <KanbanColumnContainer
                  key={col.id}
                  column={col}
                  columnIdx={colIdx}
                  totalCols={projCols.length}
                  allCols={projCols}
                  tasks={colTasks}
                  onAddTask={handleOpenAddTask}
                  onEditTask={handleOpenEditTask}
                  onDeleteColumn={deleteColumn}
                  onMoveColumn={moveTaskColumn}
                />
              );
            })}

            {/* Add Column Button / Form */}
            <div className="w-72 min-w-[280px] flex-shrink-0">
              {isAddingColumn ? (
                <form onSubmit={handleAddColumnSubmit} className="p-4 rounded-3xl theme-surface border space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Nome da Coluna ex: REVISÃO..."
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl theme-card border text-primary-theme text-xs focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <button type="submit" className="btn-primary flex-1 py-2 px-3 rounded-xl text-xs">
                      Salvar
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingColumn(false)}
                      className="btn-secondary py-2 px-3 rounded-xl text-xs"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingColumn(true)}
                  className="w-full p-4 rounded-3xl theme-surface hover:theme-card border border-dashed text-secondary-theme hover:text-primary-theme font-bold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4 text-primary-theme" />
                  <span>+ Adicionar Coluna</span>
                </button>
              )}
            </div>
          </div>

          {/* Floating Drag Overlay Preview */}
          <DragOverlay>
            {activeTask ? (
              <div className="p-4 rounded-2xl theme-surface border text-primary-theme shadow-2xl space-y-2 text-xs opacity-90 scale-105 pointer-events-none ring-2 ring-[var(--text-primary)]">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold">{activeTask.title}</h4>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase theme-card-elevated border">
                    {activeTask.priority}
                  </span>
                </div>
                {activeTask.description && (
                  <p className="text-[11px] text-secondary-theme line-clamp-1">{activeTask.description}</p>
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

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
