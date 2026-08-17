'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { EventCategory } from '@/types/calendar';
import { getTodayYMD } from '@/lib/date';
import { X, Trash2, Calendar, Filter } from 'lucide-react';

interface BulkDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmBulkDelete: (criteria: { beforeDate?: string; category?: EventCategory | 'all' }) => void;
}

const CATEGORIES: Array<EventCategory | 'all'> = ['all', 'Estudos', 'Trabalho', 'Pessoal', 'Saúde', 'Faculdade', 'Prova', 'Outros'];

export const BulkDeleteModal: React.FC<BulkDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirmBulkDelete,
}) => {
  const [mounted, setMounted] = useState(false);
  const [deleteMode, setDeleteMode] = useState<'beforeDate' | 'byCategory'>('beforeDate');
  const [beforeDate, setBeforeDate] = useState(getTodayYMD());
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'all'>('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteMode === 'beforeDate') {
      onConfirmBulkDelete({ beforeDate });
    } else {
      onConfirmBulkDelete({ category: selectedCategory });
    }
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-md my-auto p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl text-white space-y-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-400">
            <Trash2 className="w-5 h-5" />
            <h3 className="text-lg font-bold tracking-tight text-white">Limpeza em Lote</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 block">Critério de Exclusão</label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDeleteMode('beforeDate')}
                className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                  deleteMode === 'beforeDate'
                    ? 'bg-red-500/10 text-red-400 border-red-500/30'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Por Data</span>
              </button>

              <button
                type="button"
                onClick={() => setDeleteMode('byCategory')}
                className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                  deleteMode === 'byCategory'
                    ? 'bg-red-500/10 text-red-400 border-red-500/30'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Por Categoria</span>
              </button>
            </div>
          </div>

          {deleteMode === 'beforeDate' ? (
            <div className="space-y-1 p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
              <label className="text-xs font-semibold text-zinc-300 block">Excluir todos os eventos anteriores a:</label>
              <input
                type="date"
                required
                value={beforeDate}
                onChange={(e) => setBeforeDate(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <p className="text-[11px] text-zinc-500 pt-1">
                Eventos com data anterior a esta serão removidos permanentemente.
              </p>
            </div>
          ) : (
            <div className="space-y-1 p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
              <label className="text-xs font-semibold text-zinc-300 block">Excluir todos os eventos da categoria:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as EventCategory | 'all')}
                className="w-full py-2.5 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">Todas as categorias</option>
                {CATEGORIES.filter((c) => c !== 'all').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Actions */}
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
              className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/25 transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Confirmar Exclusão</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
