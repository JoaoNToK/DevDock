'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Topic, Subject, TopicStatus, TopicPriority } from '@/types/studies';
import { X, Trash2 } from 'lucide-react';

interface TopicModalProps {
  isOpen: boolean;
  topicToEdit?: Topic | null;
  subjects: Subject[];
  defaultSubjectId?: string;
  onClose: () => void;
  onSave: (data: Omit<Topic, 'id' | 'totalTimeMinutes' | 'createdAt'>) => void;
  onDelete?: (id: string) => void;
}

export const TopicModal: React.FC<TopicModalProps> = ({
  isOpen,
  topicToEdit,
  subjects,
  defaultSubjectId,
  onClose,
  onSave,
  onDelete,
}) => {
  const [mounted, setMounted] = useState(false);
  const [subjectId, setSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TopicStatus>('not_started');
  const [priority, setPriority] = useState<TopicPriority>('medium');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (topicToEdit) {
      setSubjectId(topicToEdit.subjectId);
      setTitle(topicToEdit.title);
      setDescription(topicToEdit.description || '');
      setStatus(topicToEdit.status);
      setPriority(topicToEdit.priority || 'medium');
    } else {
      setSubjectId(defaultSubjectId || subjects[0]?.id || '');
      setTitle('');
      setDescription('');
      setStatus('not_started');
      setPriority('medium');
    }
  }, [topicToEdit, defaultSubjectId, subjects, isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId) return;

    onSave({
      subjectId,
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
    });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-md my-auto p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl text-white space-y-6 relative">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight text-white">
            {topicToEdit ? 'Editar Conteúdo / Tópico' : 'Novo Conteúdo de Estudo'}
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
            <label className="text-xs font-semibold text-zinc-300 block">Matéria Pertencente</label>
            <select
              required
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300 block">Título do Tópico</label>
            <input
              type="text"
              required
              placeholder="Ex: Promises, useEffect, Relacionamentos..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300 block">Descrição (Opcional)</label>
            <textarea
              rows={2}
              placeholder="Resumo do tópico..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">Status Inicial</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TopicStatus)}
                className="w-full py-2.5 px-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="not_started">Não iniciado</option>
                <option value="in_progress">Em andamento</option>
                <option value="completed">Concluído</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">Prioridade</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TopicPriority)}
                className="w-full py-2.5 px-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="high">Alta</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
            {topicToEdit && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(topicToEdit.id);
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
                Salvar Conteúdo
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
