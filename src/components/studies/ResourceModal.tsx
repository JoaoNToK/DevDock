'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { StudyResource, Subject } from '@/types/studies';
import { X } from 'lucide-react';

interface ResourceModalProps {
  isOpen: boolean;
  subjects: Subject[];
  topics?: any[];
  defaultSubjectId?: string;
  onClose: () => void;
  onSave: (data: Omit<StudyResource, 'id' | 'createdAt'>) => void;
}

export const ResourceModal: React.FC<ResourceModalProps> = ({
  isOpen,
  subjects,
  defaultSubjectId,
  onClose,
  onSave,
}) => {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setName('');
    setUrl('');
    setDescription('');
    setSubjectId(defaultSubjectId || subjects[0]?.id || '');
  }, [defaultSubjectId, subjects, isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim() || !subjectId) return;

    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    onSave({
      subjectId,
      name: name.trim(),
      url: formattedUrl,
      description: description.trim(),
    });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-md my-auto p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl text-white space-y-6 relative">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight text-white">Novo Link / Recurso</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300 block">Matéria</label>
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
            <label className="text-xs font-semibold text-zinc-300 block">Nome do Recurso</label>
            <input
              type="text"
              required
              placeholder="Ex: Documentação Oficial, MDN, Curso..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300 block">URL / Link</label>
            <input
              type="text"
              required
              placeholder="https://developer.mozilla.org/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300 block">Descrição (Opcional)</label>
            <input
              type="text"
              placeholder="Anotações sobre este link..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
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
              Salvar Recurso
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
