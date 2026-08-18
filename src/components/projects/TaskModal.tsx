'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ProjectTask, KanbanColumn, ProjectPriority, ChecklistItem, Subtask } from '@/types/projects';
import { getTodayYMD } from '@/lib/date';
import { X, Trash2, Plus, CheckSquare } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  taskToEdit?: ProjectTask | null;
  columns: KanbanColumn[];
  defaultColumnId?: string;
  projectId: string;
  onClose: () => void;
  onSave: (data: Omit<ProjectTask, 'id' | 'focusMinutes' | 'createdAt'>) => void;
  onDelete?: (id: string) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  taskToEdit,
  columns,
  defaultColumnId,
  projectId,
  onClose,
  onSave,
  onDelete,
}) => {
  const [mounted, setMounted] = useState(false);
  const [columnId, setColumnId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<ProjectPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const today = getTodayYMD();
    if (taskToEdit) {
      setColumnId(taskToEdit.columnId);
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority || 'medium');
      setDueDate(taskToEdit.dueDate || today);
      setTagsInput(taskToEdit.tags ? taskToEdit.tags.join(', ') : '');
      setChecklist(taskToEdit.checklist || []);
      setSubtasks(taskToEdit.subtasks || []);
    } else {
      setColumnId(defaultColumnId || columns[0]?.id || '');
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate(today);
      setTagsInput('frontend, feature');
      setChecklist([]);
      setSubtasks([]);
    }
  }, [taskToEdit, defaultColumnId, columns, isOpen]);

  if (!isOpen || !mounted) return null;

  const handleAddChecklist = () => {
    if (!newChecklistText.trim()) return;
    const newItem: ChecklistItem = {
      id: `chk-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      text: newChecklistText.trim(),
      isCompleted: false,
    };
    setChecklist((prev) => [...prev, newItem]);
    setNewChecklistText('');
  };

  const handleRemoveChecklist = (id: string) => {
    setChecklist((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !columnId) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    onSave({
      projectId,
      columnId,
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDate || undefined,
      tags,
      checklist,
      subtasks,
    });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg my-auto p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl text-white space-y-6 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight text-white">
            {taskToEdit ? 'Editar Tarefa do Projeto' : 'Nova Tarefa no Kanban'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">Coluna Kanban</label>
              <select
                required
                value={columnId}
                onChange={(e) => setColumnId(e.target.value)}
                className="w-full py-2.5 px-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {columns.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">Prioridade</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ProjectPriority)}
                className="w-full py-2.5 px-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="urgent">Urgente</option>
                <option value="high">Alta</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300 block">Título da Tarefa</label>
            <input
              type="text"
              required
              placeholder="Ex: Implementar login, Criar Dashboard..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300 block">Descrição (Opcional)</label>
            <textarea
              rows={2}
              placeholder="Detalhamento técnico da tarefa..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">Prazo de Entrega</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full py-2.5 px-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">Tags (vírgula)</label>
              <input
                type="text"
                placeholder="backend, auth"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full py-2.5 px-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span>Checklist de Etapas</span>
            </label>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ex: Validar campos, Escrever testes..."
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChecklist();
                  }
                }}
                className="w-full py-2 px-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddChecklist}
                className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {checklist.length > 0 && (
              <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs"
                  >
                    <span className="text-zinc-200">{item.text}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklist(item.id)}
                      className="p-1 text-zinc-500 hover:text-red-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
            {taskToEdit && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(taskToEdit.id);
                  onClose();
                }}
                className="px-4 py-2.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all"
              >
                Salvar Tarefa
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
