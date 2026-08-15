'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { StudyGoal, Subject } from '@/types/studies';
import { getTodayYMD } from '@/lib/date';
import { X, Trash2 } from 'lucide-react';

interface GoalModalProps {
  isOpen: boolean;
  goalToEdit?: StudyGoal | null;
  subjects: Subject[];
  onClose: () => void;
  onSave: (data: Omit<StudyGoal, 'id' | 'currentValue' | 'createdAt'>) => void;
  onDelete?: (id: string) => void;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  goalToEdit,
  subjects,
  onClose,
  onSave,
  onDelete,
}) => {
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [targetValue, setTargetValue] = useState(20);
  const [type, setType] = useState<'hours' | 'topics' | 'sessions'>('hours');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const today = getTodayYMD();
    if (goalToEdit) {
      setTitle(goalToEdit.title);
      setDescription(goalToEdit.description || '');
      setSubjectId(goalToEdit.subjectId || '');
      setTargetValue(goalToEdit.targetValue);
      setType(goalToEdit.type);
      setStartDate(goalToEdit.startDate);
      setEndDate(goalToEdit.endDate);
    } else {
      setTitle('');
      setDescription('');
      setSubjectId(subjects[0]?.id || '');
      setTargetValue(20);
      setType('hours');
      setStartDate(today);
      setEndDate(today);
    }
  }, [goalToEdit, subjects, isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      subjectId: subjectId || undefined,
      targetValue: Number(targetValue) || 10,
      type,
      startDate,
      endDate,
    });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-md my-auto p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl text-white space-y-6 relative">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight text-white">
            {goalToEdit ? 'Editar Meta' : 'Nova Meta de Estudo'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300 block">Título da Meta</label>
            <input
              type="text"
              required
              placeholder="Ex: Estudar JavaScript 20 horas este mês..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">Matéria</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">(Todas)</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">Tipo de Meta</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full py-2.5 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="hours">Horas estudadas</option>
                <option value="topics">Conteúdos concluídos</option>
                <option value="sessions">Sessões de Pomodoro</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300 block">Valor Objetivo</label>
            <input
              type="number"
              min={1}
              required
              value={targetValue}
              onChange={(e) => setTargetValue(Number(e.target.value))}
              className="w-full py-2.5 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
            {goalToEdit && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(goalToEdit.id);
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
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all"
              >
                Salvar Meta
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
