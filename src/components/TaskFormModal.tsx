'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Task, TaskCategory, TaskPriority, Subtask } from '@/types/task';
import { X, Check, Plus, Trash2 } from 'lucide-react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';

interface TaskFormModalProps {
  isOpen: boolean;
  editingTask: Task | null;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'dateString' | 'completedPomodoros' | 'isCompleted'>) => void;
  onClose: () => void;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  editingTask,
  onSave,
  onClose,
}) => {
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('estudos');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [tagsInput, setTagsInput] = useState('');
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(4);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setSubtasks(editingTask.subtasks || []);
      setCategory(editingTask.category);
      setPriority(editingTask.priority);
      setTagsInput(editingTask.tags.join(', '));
      setEstimatedPomodoros(editingTask.estimatedPomodoros);
    } else {
      setTitle('');
      setDescription('');
      setSubtasks([]);
      setCategory('estudos');
      setPriority('medium');
      setTagsInput('');
      setEstimatedPomodoros(4);
    }
    setNewSubtaskTitle('');
  }, [editingTask, isOpen]);

  if (!isOpen || !mounted) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSub: Subtask = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: newSubtaskTitle.trim(),
      isCompleted: false,
    };
    setSubtasks([...subtasks, newSub]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    onSave({
      title: title.trim(),
      description: description.trim(),
      subtasks,
      category,
      priority,
      tags,
      estimatedPomodoros: Math.max(1, Math.min(50, Number(estimatedPomodoros) || 1)),
    });

    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-md my-auto p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl text-white space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Title */}
          <div className="space-y-1">
            <label htmlFor="task-title" className="text-xs font-medium text-zinc-300">
              Título da tarefa *
            </label>
            <input
              id="task-title"
              type="text"
              required
              placeholder="Ex: Estudar Cálculo II"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Details / Description */}
          <div className="space-y-1">
            <label htmlFor="task-desc" className="text-xs font-medium text-zinc-300">
              Detalhes / Descrição
            </label>
            <textarea
              id="task-desc"
              rows={2}
              placeholder="Adicionar detalhes da tarefa aqui..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Subtasks Section */}
          <div className="space-y-2 pt-1 border-t border-zinc-800/80">
            <label className="text-xs font-medium text-zinc-300 block">
              Subtarefas ({subtasks.length})
            </label>

            {/* List of Subtasks */}
            {subtasks.length > 0 && (
              <div className="space-y-1.5 max-h-28 overflow-y-auto">
                {subtasks.map((st) => (
                  <div key={st.id} className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60 text-xs">
                    <span className="text-zinc-200 truncate">{st.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="text-zinc-500 hover:text-red-400 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Add Subtask Input */}
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Subtarefa aqui..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="flex-1 py-1.5 px-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="py-1.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-indigo-400 font-semibold text-xs border border-zinc-700/60 transition-all flex items-center gap-1 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-zinc-800/80">
            {/* Category */}
            <div className="space-y-1">
              <label htmlFor="task-category" className="text-xs font-medium text-zinc-300">
                Categoria
              </label>
              <select
                id="task-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full py-1.5 px-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="estudos">Estudos</option>
                <option value="trabalho">Trabalho</option>
                <option value="programacao">Programação</option>
                <option value="pessoal">Pessoal</option>
                <option value="geral">Geral</option>
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <label htmlFor="task-priority" className="text-xs font-medium text-zinc-300">
                Prioridade
              </label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full py-1.5 px-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Estimated Pomodoros */}
            <div className="space-y-1">
              <label htmlFor="task-estimated" className="text-xs font-medium text-zinc-300">
                <span className="inline-flex items-center gap-1">Estimativa <MaterialIcon name="timer" size={14} /></span>
              </label>
              <input
                id="task-estimated"
                type="number"
                min="1"
                max="50"
                value={estimatedPomodoros}
                onChange={(e) => setEstimatedPomodoros(Number(e.target.value))}
                className="w-full py-1.5 pl-3 pr-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Tags Input */}
            <div className="space-y-1">
              <label htmlFor="task-tags" className="text-xs font-medium text-zinc-300">
                Tags (vírgula)
              </label>
              <input
                id="task-tags"
                type="text"
                placeholder="react, prova"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full py-1.5 px-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="py-2 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
            >
              {editingTask ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{editingTask ? 'Salvar' : 'Criar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
