'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Subject } from '@/types/studies';
import { X, Trash2 } from 'lucide-react';

interface SubjectModalProps {
  isOpen: boolean;
  subjectToEdit?: Subject | null;
  onClose: () => void;
  onSave: (data: Omit<Subject, 'id' | 'totalTimeMinutes' | 'createdAt'>) => void;
  onDelete?: (id: string) => void;
}

const COLORS = [
  '#6366f1', // Indigo
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#ef4444', // Red
];

export const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  subjectToEdit,
  onClose,
  onSave,
  onDelete,
}) => {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [monthlyHoursGoal, setMonthlyHoursGoal] = useState(20);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (subjectToEdit) {
      setName(subjectToEdit.name);
      setDescription(subjectToEdit.description || '');
      setColor(subjectToEdit.color || COLORS[0]);
      setMonthlyHoursGoal(subjectToEdit.monthlyHoursGoal || 20);
    } else {
      setName('');
      setDescription('');
      setColor(COLORS[0]);
      setMonthlyHoursGoal(20);
    }
  }, [subjectToEdit, isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      description: description.trim(),
      color,
      monthlyHoursGoal: Number(monthlyHoursGoal) || 10,
    });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-md my-auto p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl text-white space-y-6 relative">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight text-white">
            {subjectToEdit ? 'Editar Matéria' : 'Nova Matéria / Disciplina'}
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
            <label className="text-xs font-semibold text-zinc-300 block">Nome da Matéria</label>
            <input
              type="text"
              required
              placeholder="Ex: JavaScript, React, Matemática..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300 block">Descrição (Opcional)</label>
            <textarea
              rows={2}
              placeholder="Objetivo de aprendizado ou escopo da matéria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">Meta Mensal (Horas)</label>
              <input
                type="number"
                min={1}
                max={300}
                required
                value={monthlyHoursGoal}
                onChange={(e) => setMonthlyHoursGoal(Number(e.target.value))}
                className="w-full py-2.5 px-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">Cor de Destaque</label>
              <div className="flex items-center gap-1.5 pt-1">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      color === c ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
            {subjectToEdit && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(subjectToEdit.id);
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
                Salvar Matéria
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
