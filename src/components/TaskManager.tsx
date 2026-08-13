'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Task, TaskCategory, TaskPriority, TaskFilterStatus, Subtask } from '@/types/task';
import { TaskFormModal } from '@/components/TaskFormModal';
import {
  GripVertical,
  Circle,
  CheckCircle2,
  MoreVertical,
  Star,
  Target,
  Edit3,
  Trash2,
  Search,
  Plus,
  PlusCircle,
  CornerDownRight,
  Check,
} from 'lucide-react';

interface TaskManagerProps {
  tasks: Task[];
  activeTaskId: string | null;
  onAddTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'dateString' | 'completedPomodoros' | 'isCompleted'>) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onSetActiveTask: (id: string | null) => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  activeTaskId,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleComplete,
  onSetActiveTask,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Quick Add State
  const [quickTitle, setQuickTitle] = useState('');
  const [isQuickAddActive, setIsQuickAddActive] = useState(false);

  // Inline Subtask Input State per task
  const [addingSubtaskForId, setAddingSubtaskForId] = useState<string | null>(null);
  const [inlineSubtaskTitle, setInlineSubtaskTitle] = useState('');

  // Portal mount check for SSR safety
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Context Menu State
  const [openMenuTaskId, setOpenMenuTaskId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskFilterStatus>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Close context menu on outside click or scroll
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuTaskId(null);
      }
    };

    const handleScroll = () => {
      if (openMenuTaskId) {
        setOpenMenuTaskId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [openMenuTaskId]);

  const activeTask = useMemo(() => {
    return tasks.find((t) => t.id === activeTaskId) || null;
  }, [tasks, activeTaskId]);

  const openMenuTask = useMemo(() => {
    return tasks.find((t) => t.id === openMenuTaskId) || null;
  }, [tasks, openMenuTaskId]);

  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  // Filter & Search Logic
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = (task.description || '').toLowerCase().includes(query);
        const matchesTags = task.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesDesc && !matchesTags) return false;
      }

      if (filterStatus === 'today' && task.dateString !== todayStr) return false;
      if (filterStatus === 'starred' && !task.isStarred) return false;
      if (filterStatus === 'pending' && task.isCompleted) return false;
      if (filterStatus === 'completed' && !task.isCompleted) return false;

      if (filterCategory !== 'all' && task.category !== filterCategory) return false;
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false;

      return true;
    });
  }, [tasks, searchQuery, filterStatus, filterCategory, filterPriority, todayStr]);

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    onAddTask({
      title: quickTitle.trim(),
      description: '',
      subtasks: [],
      category: 'estudos',
      priority: 'medium',
      tags: [],
      estimatedPomodoros: 4,
    });

    setQuickTitle('');
    setIsQuickAddActive(false);
  };

  const handleToggleMenu = (taskId: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (openMenuTaskId === taskId) {
      setOpenMenuTaskId(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const menuWidth = 224; // 14rem = 224px

      // Position dropdown directly under the 3-dots button, right-aligned to button
      const leftPos = Math.max(10, Math.min(window.innerWidth - menuWidth - 10, rect.right - menuWidth));
      const topPos = rect.bottom + 4;

      setMenuPos({ top: topPos, left: leftPos });
      setOpenMenuTaskId(taskId);
    }
  };

  const handleAddInlineSubtask = (taskId: string) => {
    if (!inlineSubtaskTitle.trim()) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newSub: Subtask = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: inlineSubtaskTitle.trim(),
      isCompleted: false,
    };

    const updatedSubtasks = [...(task.subtasks || []), newSub];
    onUpdateTask(taskId, { subtasks: updatedSubtasks });

    setInlineSubtaskTitle('');
    setAddingSubtaskForId(null);
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !task.subtasks) return;

    const updatedSubtasks = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
    );

    onUpdateTask(taskId, { subtasks: updatedSubtasks });
  };

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
    setOpenMenuTaskId(null);
  };

  const handleSaveModal = (taskData: Omit<Task, 'id' | 'createdAt' | 'dateString' | 'completedPomodoros' | 'isCompleted'>) => {
    if (editingTask) {
      onUpdateTask(editingTask.id, taskData);
    } else {
      onAddTask(taskData);
    }
  };

  const toggleStar = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateTask(task.id, { isStarred: !task.isStarred });
  };

  const getCategoryLabel = (cat: TaskCategory) => {
    switch (cat) {
      case 'estudos': return 'Estudos';
      case 'trabalho': return 'Trabalho';
      case 'programacao': return 'Programação';
      case 'pessoal': return 'Pessoal';
      case 'geral': return 'Geral';
    }
  };

  return (
    <div className="w-full rounded-3xl bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/80 p-5 sm:p-6 shadow-xl space-y-4 text-white h-full relative">
      {/* Top Quick Creation Header — Google Tasks Style */}
      <div className="rounded-2xl bg-zinc-950/80 border border-zinc-800/80 p-3 shadow-inner">
        {isQuickAddActive ? (
          <form onSubmit={handleQuickAddSubmit} className="flex items-center gap-3">
            <PlusCircle className="w-5 h-5 text-indigo-400 shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Digite o nome da tarefa e pressione Enter..."
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              onBlur={() => {
                if (!quickTitle.trim()) setIsQuickAddActive(false);
              }}
              className="w-full bg-transparent text-sm font-semibold text-white placeholder-zinc-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleOpenCreateModal}
              title="Mais opções de detalhes"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium whitespace-nowrap px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20"
            >
              + Detalhes
            </button>
          </form>
        ) : (
          <div
            onClick={() => setIsQuickAddActive(true)}
            className="flex items-center justify-between cursor-pointer group text-zinc-400 hover:text-zinc-200"
          >
            <div className="flex items-center gap-3">
              <PlusCircle className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-zinc-300 group-hover:text-white">
                Adicionar uma tarefa
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenCreateModal();
              }}
              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Criar com formulário completo"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Active Task Banner */}
      {activeTask ? (
        <div className="p-3 rounded-2xl bg-indigo-950/70 border border-indigo-800/70 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5 min-w-0">
            <Target className="w-4 h-4 text-indigo-400 shrink-0 animate-pulse" />
            <div className="min-w-0">
              <span className="text-[10px] text-indigo-300 font-semibold block uppercase tracking-wider">
                Focando agora
              </span>
              <p className="text-xs font-bold text-white truncate">{activeTask.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono font-bold text-amber-400">
              {activeTask.completedPomodoros}/{activeTask.estimatedPomodoros} 🍅
            </span>
            <button
              onClick={() => onSetActiveTask(null)}
              className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-[10px] font-semibold transition-colors"
            >
              Desvincular
            </button>
          </div>
        </div>
      ) : null}

      {/* Search & Filters */}
      <div className="space-y-2 pt-1">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-3 text-zinc-400" />
          <input
            type="text"
            placeholder="Pesquisar tarefas ou #tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-1.5 pl-8 pr-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs">
          {(['all', 'today', 'starred', 'pending', 'completed'] as TaskFilterStatus[]).map((st) => {
            const labels: Record<TaskFilterStatus, string> = {
              all: 'Todas',
              today: 'Hoje',
              starred: '★ Estrela',
              pending: 'Pendentes',
              completed: 'Concluídas',
            };
            const isActive = filterStatus === st;
            return (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`flex-1 py-1 px-1.5 rounded-lg font-medium text-[11px] transition-colors ${
                  isActive
                    ? 'bg-zinc-800 text-indigo-400 font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {labels[st]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Task List Container */}
      <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            {tasks.length === 0 ? 'Nenhuma tarefa criada. Clique em "Adicionar uma tarefa" no topo!' : 'Nenhuma tarefa encontrada para este filtro.'}
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isSelectedForFocus = activeTaskId === task.id;
            const isAddingSubtask = addingSubtaskForId === task.id;

            return (
              <div
                key={task.id}
                className={`group relative p-3.5 rounded-2xl border transition-all space-y-2 ${
                  isSelectedForFocus
                    ? 'bg-zinc-950 border-indigo-600/80 shadow-md shadow-indigo-500/10'
                    : task.isCompleted
                    ? 'bg-zinc-950/40 border-zinc-800/40 opacity-60'
                    : 'bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                {/* Main Task Row */}
                <div className="flex items-start justify-between gap-2.5">
                  {/* Grip Handle */}
                  <div className="mt-0.5 text-zinc-600 group-hover:text-zinc-400 cursor-grab shrink-0">
                    <GripVertical className="w-4 h-4" />
                  </div>

                  {/* Circular Checkbox */}
                  <button
                    onClick={() => onToggleComplete(task.id)}
                    className="mt-0.5 text-zinc-400 hover:text-emerald-400 transition-colors focus:outline-none shrink-0"
                    aria-label="Marcar tarefa"
                  >
                    {task.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 hover:stroke-indigo-400" />
                    )}
                  </button>

                  {/* Main Content Area: Title + Details Text */}
                  <div className="flex-1 min-w-0 space-y-1">
                    {/* Task Title */}
                    <p
                      className={`text-sm font-semibold leading-snug break-words ${
                        task.isCompleted ? 'line-through text-zinc-500' : 'text-zinc-100'
                      }`}
                    >
                      {task.title}
                    </p>

                    {/* Task Details / Description text under title */}
                    {task.description && (
                      <p className="text-xs text-zinc-400 font-normal leading-relaxed break-words">
                        {task.description}
                      </p>
                    )}

                    {/* Chips & Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-zinc-800 text-zinc-300">
                        {task.dateString === todayStr ? 'Hoje' : 'Agendado'}
                      </span>

                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-800 text-amber-400 flex items-center gap-1">
                        <span>🍅</span>
                        <span>{task.completedPomodoros}/{task.estimatedPomodoros}</span>
                      </span>

                      {task.priority === 'high' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                          Alta
                        </span>
                      )}
                      {task.priority === 'medium' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Média
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-800/80 text-zinc-400">
                        {getCategoryLabel(task.category)}
                      </span>

                      {task.tags.map((tg, idx) => (
                        <span key={idx} className="text-[10px] text-indigo-400 font-mono">
                          #{tg}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right Actions: Star Icon & Three Dots Menu */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => toggleStar(task, e)}
                      className="p-1 text-zinc-500 hover:text-amber-400 transition-colors"
                      title={task.isStarred ? 'Remover das favoritas' : 'Com estrela'}
                    >
                      <Star className={`w-4 h-4 ${task.isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>

                    <button
                      onClick={(e) => handleToggleMenu(task.id, e)}
                      className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      title="Opções"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subtasks List */}
                {task.subtasks && task.subtasks.length > 0 && (
                  <div className="ml-7 pt-1.5 space-y-1.5 border-l-2 border-zinc-800/80 pl-3">
                    {task.subtasks.map((st) => (
                      <div key={st.id} className="flex items-center gap-2.5 group/sub">
                        <button
                          onClick={() => handleToggleSubtask(task.id, st.id)}
                          className="text-zinc-500 hover:text-emerald-400 transition-colors focus:outline-none shrink-0"
                          aria-label="Marcar subtarefa"
                        >
                          {st.isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Circle className="w-4 h-4 hover:stroke-indigo-400" />
                          )}
                        </button>

                        <span
                          className={`text-xs ${
                            st.isCompleted ? 'line-through text-zinc-500' : 'text-zinc-200'
                          }`}
                        >
                          {st.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline Subtask Creation Input */}
                {isAddingSubtask && (
                  <div className="ml-7 pt-1 border-l-2 border-indigo-500/50 pl-3 flex items-center gap-2">
                    <CornerDownRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Subtarefa aqui..."
                      value={inlineSubtaskTitle}
                      onChange={(e) => setInlineSubtaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddInlineSubtask(task.id);
                        } else if (e.key === 'Escape') {
                          setAddingSubtaskForId(null);
                        }
                      }}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg py-1 px-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => handleAddInlineSubtask(task.id)}
                      className="py-1 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Floating Popover Context Menu via React Portal to document.body (100% position & overflow proof!) */}
      {mounted && openMenuTaskId && openMenuTask && createPortal(
        <div
          ref={menuRef}
          style={{ top: `${menuPos.top}px`, left: `${menuPos.left}px` }}
          className="fixed z-[100] w-56 rounded-2xl bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/90 shadow-2xl p-1.5 text-xs text-zinc-200 animate-fade-in space-y-0.5"
        >
          {/* Star Toggle */}
          <button
            onClick={(e) => {
              toggleStar(openMenuTask, e);
              setOpenMenuTaskId(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-800 transition-colors text-left"
          >
            <Star className={`w-4 h-4 ${openMenuTask.isStarred ? 'fill-amber-400 text-amber-400' : 'text-zinc-400'}`} />
            <span>{openMenuTask.isStarred ? 'Remover das "Com estrela"' : 'Adicionar a "Com estrela"'}</span>
          </button>

          {/* Add Subtask Item */}
          <button
            onClick={() => {
              setAddingSubtaskForId(openMenuTask.id);
              setOpenMenuTaskId(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-800 transition-colors text-left"
          >
            <CornerDownRight className="w-4 h-4 text-indigo-400" />
            <span>Adicionar uma subtarefa</span>
          </button>

          {/* Focus on Timer */}
          <button
            onClick={() => {
              onSetActiveTask(activeTaskId === openMenuTask.id ? null : openMenuTask.id);
              setOpenMenuTaskId(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-800 transition-colors text-left"
          >
            <Target className="w-4 h-4 text-indigo-400" />
            <span>{activeTaskId === openMenuTask.id ? 'Desvincular do Timer' : 'Focar no Pomodoro'}</span>
          </button>

          {/* Edit */}
          <button
            onClick={() => handleOpenEditModal(openMenuTask)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-800 transition-colors text-left"
          >
            <Edit3 className="w-4 h-4 text-zinc-400" />
            <span>Editar tarefa</span>
          </button>

          {/* Delete */}
          <button
            onClick={() => {
              onDeleteTask(openMenuTask.id);
              setOpenMenuTaskId(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-800 text-red-400 transition-colors text-left"
          >
            <Trash2 className="w-4 h-4" />
            <span>Excluir</span>
          </button>

          {/* Separator */}
          <div className="my-1 border-t border-zinc-800" />

          <div className="px-3 py-1 text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
            Categoria
          </div>
          {(['estudos', 'trabalho', 'programacao', 'pessoal', 'geral'] as TaskCategory[]).map((cat) => {
            const isCatActive = openMenuTask.category === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  onUpdateTask(openMenuTask.id, { category: cat });
                  setOpenMenuTaskId(null);
                }}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl hover:bg-zinc-800 transition-colors text-left text-xs"
              >
                <span className="text-zinc-300">{getCategoryLabel(cat)}</span>
                {isCatActive && <Check className="w-3.5 h-3.5 text-indigo-400" />}
              </button>
            );
          })}
        </div>,
        document.body
      )}

      {/* Full Task Creation / Edit Modal */}
      <TaskFormModal
        isOpen={isModalOpen}
        editingTask={editingTask}
        onSave={handleSaveModal}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
