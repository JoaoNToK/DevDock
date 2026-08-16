'use client';

import React, { useState, useEffect } from 'react';
import { Category } from '@/types/category';
import { X, Tag, Palette, Smile } from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  categoryToEdit?: Category | null;
  onClose: () => void;
  onSave: (name: string, color: string, icon?: string) => void;
}

const PRESET_COLORS = [
  '#6366F1', '#0EA5E9', '#10B981', '#F59E0B',
  '#EC4899', '#8B5CF6', '#EF4444', '#14B8A6',
  '#F97316', '#64748B', '#0284C7', '#059669',
];

const PRESET_ICONS = ['📁', '📚', '💼', '👤', '🚀', '🎓', '💰', '❤️', '🎯', '📌', '💡', '🛠️'];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  categoryToEdit,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366F1');
  const [icon, setIcon] = useState('📁');

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setColor(categoryToEdit.color);
      setIcon(categoryToEdit.icon || '📁');
    } else {
      setName('');
      setColor('#6366F1');
      setIcon('📁');
    }
  }, [categoryToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), color, icon);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md p-6 rounded-3xl theme-surface border backdrop-blur-xl shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-primary-theme">
              {categoryToEdit ? 'Editar Categoria' : 'Nova Categoria'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-secondary-theme hover:text-primary-theme hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-secondary-theme uppercase mb-1.5">
              Nome da Categoria
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Finanças, Saúde, Ideias..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full py-2.5 px-3 rounded-2xl theme-surface border text-sm text-primary-theme focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-secondary-theme uppercase mb-1.5 flex items-center gap-1.5">
              <Smile className="w-3.5 h-3.5" />
              <span>Ícone</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_ICONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`w-9 h-9 rounded-xl text-base flex items-center justify-center transition-all ${
                    icon === emoji
                      ? 'theme-card-elevated border-2 border-indigo-500 scale-110 shadow-md'
                      : 'theme-surface border hover:border-zinc-700'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-secondary-theme uppercase mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" />
              <span>Cor</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-xl transition-all ${
                    color === c
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-950 scale-110 shadow-md'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-2xl theme-surface border text-xs font-bold text-secondary-theme hover:text-primary-theme transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all"
            >
              {categoryToEdit ? 'Salvar Alterações' : 'Criar Categoria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
