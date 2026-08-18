'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useProjects } from '@/hooks/useProjects';
import { useAcademic } from '@/hooks/useAcademic';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import {
  Search,
  FolderKanban,
  CheckSquare,
  GraduationCap,
  Calendar,
  Timer,
  Settings,
  ArrowRight,
  Command,
  X,
} from 'lucide-react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';

export interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchItem {
  id: string;
  category: 'projetos' | 'tarefas' | 'faculdade' | 'calendario' | 'acoes';
  title: string;
  subtitle?: string;
  icon: string | React.ReactNode;
  action: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { projects, tasks: kanbanTasks } = useProjects();
  const { subjects, assignments } = useAcademic();
  const { events } = useCalendarEvents();

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Aggregate and filter search items
  const items = useMemo(() => {
    const results: SearchItem[] = [];
    const q = query.toLowerCase().trim();

    // 1. Ações Rápidas (Always available or matched)
    const quickActions: SearchItem[] = [
      {
        id: 'action-pomodoro',
        category: 'acoes',
        title: 'Iniciar Timer Pomodoro',
        subtitle: 'Ir para o módulo Pomodoro',
        icon: <Timer className="w-4 h-4 text-indigo-400" />,
        action: () => {
          router.push('/pomodoro');
          onClose();
        },
      },
      {
        id: 'action-novo-projeto',
        category: 'acoes',
        title: 'Criar Novo Projeto',
        subtitle: 'Ir para o painel de Projetos',
        icon: <FolderKanban className="w-4 h-4 text-cyan-400" />,
        action: () => {
          router.push('/projetos');
          onClose();
        },
      },
      {
        id: 'action-nova-disciplina',
        category: 'acoes',
        title: 'Cadastrar Disciplina da Faculdade',
        subtitle: 'Ir para Estudos & Faculdade',
        icon: <GraduationCap className="w-4 h-4 text-purple-400" />,
        action: () => {
          router.push('/estudos/faculdade/disciplinas');
          onClose();
        },
      },
      {
        id: 'action-calendario',
        category: 'acoes',
        title: 'Ver Calendário & Eventos',
        subtitle: 'Visualizar planejamento mensal/semanal',
        icon: <Calendar className="w-4 h-4 text-emerald-400" />,
        action: () => {
          router.push('/calendario');
          onClose();
        },
      },
      {
        id: 'action-configuracoes',
        category: 'acoes',
        title: 'Configurações do DevDock',
        subtitle: 'Preferências do sistema & perfil',
        icon: <Settings className="w-4 h-4 text-amber-400" />,
        action: () => {
          router.push('/configuracoes');
          onClose();
        },
      },
    ];

    // Filter quick actions if query exists
    quickActions.forEach((act) => {
      if (!q || act.title.toLowerCase().includes(q) || (act.subtitle && act.subtitle.toLowerCase().includes(q))) {
        results.push(act);
      }
    });

    // 2. Projetos
    projects.forEach((p) => {
      if (!q || p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))) {
        results.push({
          id: `proj-${p.id}`,
          category: 'projetos',
          title: p.name,
          subtitle: `Projeto DevDock • Status: ${p.status}`,
          icon: <MaterialIcon name={p.icon || 'rocket_launch'} size={18} />,
          action: () => {
            router.push(`/projetos/${p.id}`);
            onClose();
          },
        });
      }
    });

    // 3. Tarefas Kanban
    kanbanTasks.forEach((t) => {
      if (!q || t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q))) {
        results.push({
          id: `task-${t.id}`,
          category: 'tarefas',
          title: t.title,
          subtitle: `Tarefa Kanban • Prioridade: ${t.priority}`,
          icon: <CheckSquare className="w-4 h-4 text-indigo-400" />,
          action: () => {
            router.push(`/projetos/${t.projectId}/kanban`);
            onClose();
          },
        });
      }
    });

    // 4. Disciplinas e Trabalhos Acadêmicos
    subjects.forEach((s) => {
      if (!q || s.name.toLowerCase().includes(q) || (s.code && s.code.toLowerCase().includes(q))) {
        results.push({
          id: `subj-${s.id}`,
          category: 'faculdade',
          title: s.name,
          subtitle: `Disciplina • ${s.professor || 'Professor não especificado'}`,
          icon: <GraduationCap className="w-4 h-4 text-purple-400" />,
          action: () => {
            router.push(`/estudos/faculdade/disciplinas`);
            onClose();
          },
        });
      }
    });

    assignments.forEach((a) => {
      if (!q || a.title.toLowerCase().includes(q)) {
        results.push({
          id: `assig-${a.id}`,
          category: 'faculdade',
          title: a.title,
          subtitle: `Avaliação/Trabalho • Data: ${a.dueDate}`,
          icon: <GraduationCap className="w-4 h-4 text-cyan-400" />,
          action: () => {
            router.push('/estudos/faculdade/avaliacoes');
            onClose();
          },
        });
      }
    });

    // 5. Calendário
    events.forEach((e) => {
      if (!q || e.title.toLowerCase().includes(q)) {
        results.push({
          id: `evt-${e.id}`,
          category: 'calendario',
          title: e.title,
          subtitle: `Evento de Calendário • Data: ${e.dateString}`,
          icon: <Calendar className="w-4 h-4 text-emerald-400" />,
          action: () => {
            router.push('/calendario');
            onClose();
          },
        });
      }
    });

    return results;
  }, [query, projects, kanbanTasks, subjects, assignments, events, router, onClose]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  // Keyboard navigation inside command palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[selectedIndex]) {
        items[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl theme-surface border rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-zinc-800/80 flex items-center gap-3">
          <Search className="w-5 h-5 text-tertiary-theme" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Digite para buscar projetos, tarefas, disciplinas ou ações... (Esc para fechar)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm text-primary-theme focus:outline-none font-medium placeholder:text-tertiary-theme"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-tertiary-theme hover:text-primary-theme transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1 flex-1">
          {items.length === 0 ? (
            <div className="p-8 text-center text-xs text-secondary-theme">
              Nenhum resultado encontrado para &quot;{query}&quot;.
            </div>
          ) : (
            items.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                    isSelected ? 'theme-card-elevated border border-indigo-500/50 text-primary-theme shadow-sm' : 'theme-surface text-secondary-theme border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-zinc-800/80">{item.icon}</div>
                    <div>
                      <h4 className="text-xs font-bold text-primary-theme">{item.title}</h4>
                      {item.subtitle && (
                        <p className="text-[11px] text-tertiary-theme font-mono">{item.subtitle}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <span className="text-[10px] font-mono text-indigo-400 font-bold flex items-center gap-1">
                        <span>Enter</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="p-3 bg-zinc-900/90 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-tertiary-theme px-4">
          <div className="flex items-center gap-3">
            <span>↑↓ para navegar</span>
            <span>↵ para selecionar</span>
            <span>Esc para fechar</span>
          </div>
          <div className="flex items-center gap-1">
            <Command className="w-3 h-3" />
            <span>+ K</span>
          </div>
        </div>
      </div>
    </div>
  );
};
