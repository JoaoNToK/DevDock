'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  AcademicAssignment,
  AcademicSubject,
  AcademicEventType,
  AssignmentStatus,
  ChecklistItem,
} from '@/types/academic';
import { getTodayYMD } from '@/lib/date';
import { X, Trash2, Plus, CheckSquare } from 'lucide-react';

interface AssignmentModalProps {
  isOpen: boolean;
  assignmentToEdit?: AcademicAssignment | null;
  subjects: AcademicSubject[];
  defaultSubjectId?: string;
  defaultType?: AcademicEventType;
  onClose: () => void;
  onSave: (data: Omit<AcademicAssignment, 'id' | 'createdAt'>) => void;
  onDelete?: (id: string) => void;
}

const EVENT_TYPES: { type: AcademicEventType; label: string; icon: string }[] = [
  { type: 'prova', label: 'Prova', icon: 'edit_note' },
  { type: 'trabalho', label: 'Trabalho', icon: 'description' },
  { type: 'atividade', label: 'Atividade', icon: 'menu_book' },
  { type: 'apresentacao', label: 'Apresentação', icon: 'mic' },
  { type: 'tde', label: 'TDE', icon: 'assignment' },
  { type: 'projeto', label: 'Projeto', icon: 'science' },
  { type: 'seminario', label: 'Seminário', icon: 'menu_book' },
  { type: 'outro', label: 'Outro', icon: 'push_pin' },
];

export const AssignmentModal: React.FC<AssignmentModalProps> = ({
  isOpen,
  assignmentToEdit,
  subjects,
  defaultSubjectId,
  defaultType,
  onClose,
  onSave,
  onDelete,
}) => {
  const [mounted, setMounted] = useState(false);
  const [subjectId, setSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<AcademicEventType>('prova');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('19:00');
  const [location, setLocation] = useState('');
  const [weight, setWeight] = useState<number | undefined>(undefined);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('high');
  const [status, setStatus] = useState<AssignmentStatus>('in_progress');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const today = getTodayYMD();
    if (assignmentToEdit) {
      setSubjectId(assignmentToEdit.subjectId);
      setTitle(assignmentToEdit.title);
      setDescription(assignmentToEdit.description || '');
      setType(assignmentToEdit.type);
      setDueDate(assignmentToEdit.dueDate);
      setDueTime(assignmentToEdit.dueTime || '19:00');
      setLocation(assignmentToEdit.location || '');
      setWeight(assignmentToEdit.weight);
      setPriority(assignmentToEdit.priority || 'high');
      setStatus(assignmentToEdit.status);
      setChecklist(assignmentToEdit.checklist || []);
    } else {
      setSubjectId(defaultSubjectId || subjects[0]?.id || '');
      setTitle('');
      setDescription('');
      setType(defaultType || 'prova');
      setDueDate(today);
      setDueTime('19:00');
      setLocation('');
      setWeight(undefined);
      setPriority('high');
      setStatus('in_progress');
      setChecklist([]);
    }
  }, [assignmentToEdit, defaultSubjectId, defaultType, subjects, isOpen]);

  if (!isOpen || !mounted) return null;

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    const newItem: ChecklistItem = {
      id: `chk-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      text: newChecklistText.trim(),
      isCompleted: false,
    };
    setChecklist((prev) => [...prev, newItem]);
    setNewChecklistText('');
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId || !dueDate) return;

    onSave({
      subjectId,
      title: title.trim(),
      description: description.trim(),
      type,
      dueDate,
      dueTime: dueTime.trim(),
      location: location.trim(),
      weight: weight ? Number(weight) : undefined,
      priority,
      status,
      checklist,
    });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg my-auto p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl text-white space-y-6 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight text-white">
            {assignmentToEdit ? 'Editar Evento Acadêmico' : 'Novo Evento / Prova / Trabalho'}
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
              <label className="text-xs font-semibold text-zinc-300 block">Tipo de Evento</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AcademicEventType)}
                className="w-full py-2.5 px-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t.type} value={t.type}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">Disciplina</label>
              <select
                required
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full py-2.5 px-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300 block">Título / Nome</label>
            <input
              type="text"
              required
              placeholder="Ex: Prova P1, Trabalho de Banco de Dados..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300 block">Descrição (Opcional)</label>
            <textarea
              rows={2}
              placeholder="Conteúdos cobrados, observações ou orientações do professor..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">Data Limite</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full py-2.5 px-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">Horário</label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full py-2.5 px-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AssignmentStatus)}
                className="w-full py-2.5 px-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="not_started">Não iniciado</option>
                <option value="in_progress">Em andamento</option>
                <option value="review">Em revisão</option>
                <option value="submitted">Entregue</option>
                <option value="overdue">Atrasado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">Local / Sala / Portal</label>
              <input
                type="text"
                placeholder="Lab 04 ou Portal AVA"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full py-2.5 px-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">Peso / Nota (Opcional)</label>
              <input
                type="number"
                step="0.1"
                placeholder="Ex: 3.0"
                value={weight || ''}
                onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full py-2.5 px-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Checklist Items Section */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Checklist de Etapas do Trabalho</span>
            </label>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ex: Criar diagramas, Escrever API, Testar..."
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChecklistItem();
                  }
                }}
                className="w-full py-2 px-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {checklist.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs"
                  >
                    <span className="text-zinc-200">{item.text}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklistItem(item.id)}
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
            {assignmentToEdit && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(assignmentToEdit.id);
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
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 transition-all"
              >
                Salvar Evento
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
