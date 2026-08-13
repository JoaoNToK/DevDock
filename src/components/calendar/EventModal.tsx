'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CalendarEvent, EventCategory } from '@/types/calendar';
import { X, Trash2 } from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  eventToEdit?: CalendarEvent | null;
  defaultDate?: string;
  onClose: () => void;
  onSave: (data: Omit<CalendarEvent, 'id' | 'createdAt'>) => void;
  onDelete?: (id: string) => void;
}

const CATEGORIES: EventCategory[] = ['Estudos', 'Trabalho', 'Pessoal', 'Saúde', 'Outros'];

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  eventToEdit,
  defaultDate,
  onClose,
  onSave,
  onDelete,
}) => {
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateString, setDateString] = useState('');
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('15:00');
  const [category, setCategory] = useState<EventCategory>('Estudos');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setDescription(eventToEdit.description || '');
      setDateString(eventToEdit.dateString);
      setStartTime(eventToEdit.startTime);
      setEndTime(eventToEdit.endTime);
      setCategory(eventToEdit.category);
    } else {
      setTitle('');
      setDescription('');
      setDateString(defaultDate || new Date().toISOString().split('T')[0]);
      setStartTime('14:00');
      setEndTime('15:00');
      setCategory('Estudos');
    }
  }, [eventToEdit, defaultDate, isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      dateString,
      startTime,
      endTime,
      category,
    });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg my-auto p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl text-white space-y-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight text-white">
            {eventToEdit ? 'Editar Evento' : 'Novo Evento no Calendário'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300 block">Título do Evento</label>
            <input
              type="text"
              required
              placeholder="Ex: Estudar JavaScript, Reunião..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300 block">Descrição / Anotação</label>
            <textarea
              rows={2}
              placeholder="Detalhes sobre o evento..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Date & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">Data</label>
              <input
                type="date"
                required
                value={dateString}
                onChange={(e) => setDateString(e.target.value)}
                className="w-full py-2.5 px-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="w-full py-2.5 px-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Start & End Times */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">Hora Inicial</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full py-2.5 px-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">Hora Final</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full py-2.5 px-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
            {eventToEdit && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(eventToEdit.id);
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
