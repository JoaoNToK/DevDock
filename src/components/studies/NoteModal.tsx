'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { StudyNote, Subject, Topic } from '@/types/studies';
import { X, Trash2 } from 'lucide-react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';

interface NoteModalProps {
  isOpen: boolean;
  noteToEdit?: StudyNote | null;
  subjects: Subject[];
  topics: Topic[];
  defaultSubjectId?: string;
  onClose: () => void;
  onSave: (data: Omit<StudyNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDelete?: (id: string) => void;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  noteToEdit,
  subjects,
  topics,
  defaultSubjectId,
  onClose,
  onSave,
  onDelete,
}) => {
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (noteToEdit) {
      setTitle(noteToEdit.title);
      setContent(noteToEdit.content);
      setSubjectId(noteToEdit.subjectId || '');
      setTopicId(noteToEdit.topicId || '');
      setTagsInput(noteToEdit.tags ? noteToEdit.tags.join(', ') : '');
      setIsPinned(noteToEdit.isPinned);
    } else {
      setTitle('');
      setContent('');
      setSubjectId(defaultSubjectId || subjects[0]?.id || '');
      setTopicId('');
      setTagsInput('javascript, async');
      setIsPinned(false);
    }
  }, [noteToEdit, defaultSubjectId, subjects, isOpen]);

  if (!isOpen || !mounted) return null;

  const filteredTopics = topics.filter((t) => !subjectId || t.subjectId === subjectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    onSave({
      title: title.trim(),
      content: content.trim(),
      subjectId: subjectId || undefined,
      topicId: topicId || undefined,
      tags,
      isPinned,
      isArchived: noteToEdit ? noteToEdit.isArchived : false,
    });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-xl my-auto p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl text-white space-y-6 relative">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight text-white">
            {noteToEdit ? 'Editar Anotação' : 'Nova Anotação de Estudo'}
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
            <label className="text-xs font-semibold text-zinc-300 block">Título da Nota</label>
            <input
              type="text"
              required
              placeholder="Ex: Resumo sobre Promises, Dica de useEffect..."
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
                <option value="">(Nenhuma)</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">Conteúdo Relacionado</label>
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">(Nenhum)</option>
                {filteredTopics.map((top) => (
                  <option key={top.id} value={top.id}>
                    {top.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300 block">Anotações / Conteúdo</label>
            <textarea
              rows={6}
              required
              placeholder="Escreva suas anotações aqui..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full py-3 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono leading-relaxed"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300 block">Tags (separadas por vírgula)</label>
            <input
              type="text"
              placeholder="javascript, async, react"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
            />
            <span className="text-xs text-zinc-300 font-semibold flex items-center gap-1">Fixar nota no topo <MaterialIcon name="push_pin" size={14} /></span>
          </label>

          <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
            {noteToEdit && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(noteToEdit.id);
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
                Salvar Anotação
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
