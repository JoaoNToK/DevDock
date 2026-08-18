'use client';

import React from 'react';
import { X, Keyboard, Command, Sparkles, Navigation, Timer, Search, Settings } from 'lucide-react';

interface ShortcutGroup {
  category: string;
  items: { keys: string[]; description: string }[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    category: 'Navegação Rápida',
    items: [
      { keys: ['Alt', '1'], description: 'Ir para Dashboard / Home' },
      { keys: ['Alt', '2'], description: 'Ir para o Pomodoro Timer' },
      { keys: ['Alt', '3'], description: 'Ir para Projetos & Kanban' },
      { keys: ['Alt', '4'], description: 'Ir para Estudos & Faculdade' },
      { keys: ['Alt', '5'], description: 'Ir para Calendário & Planejamento' },
      { keys: ['Alt', '6'], description: 'Ir para Configurações' },
    ],
  },
  {
    category: 'Timer Pomodoro & Foco',
    items: [
      { keys: ['Espaço'], description: 'Iniciar / Pausar Timer (fora de campos de texto)' },
      { keys: ['Ctrl', 'K'], description: 'Abrir Busca Global & Paleta de Comandos' },
    ],
  },
  {
    category: 'Geral & Ajuda',
    items: [
      { keys: ['?'], description: 'Abrir este Guia de Atalhos de Teclado' },
      { keys: ['Esc'], description: 'Fechar modais ou janelas ativas' },
    ],
  },
];

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl theme-surface border rounded-3xl p-6 space-y-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-tertiary-theme hover:text-primary-theme hover:bg-zinc-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Keyboard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-primary-theme">Atalhos de Teclado Universais</h3>
            <p className="text-xs text-secondary-theme">Aumente sua produtividade usando comandos de teclado</p>
          </div>
        </div>

        <div className="space-y-5">
          {SHORTCUT_GROUPS.map((group, idx) => (
            <div key={idx} className="space-y-2.5">
              <h4 className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider">
                {group.category}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {group.items.map((item, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl theme-surface border flex items-center justify-between gap-2"
                  >
                    <span className="text-xs text-secondary-theme font-medium">{item.description}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="py-0.5 px-2 rounded-lg bg-zinc-800 border border-zinc-700 text-[10px] font-mono font-bold text-primary-theme shadow-sm"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-zinc-800 text-center text-xs text-tertiary-theme">
          Dica: Pressione <kbd className="py-0.5 px-1.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-[10px] font-bold text-primary-theme">?</kbd> em qualquer página para abrir este guia.
        </div>
      </div>
    </div>
  );
};
