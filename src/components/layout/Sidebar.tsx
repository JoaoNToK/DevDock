'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import {
  Home,
  Timer,
  Calendar,
  ClipboardList,
  BookOpen,
  GraduationCap,
  FolderKanban,
  ChevronDown,
  ChevronRight,
  BarChart2,
  Settings,
  Download,
  X,
  LayoutGrid,
  CheckSquare,
  FileText,
  Target,
  Clock,
  Paperclip,
} from 'lucide-react';

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile, onCloseMobile }) => {
  const pathname = usePathname();
  const { canInstall, promptInstall } = usePWAInstall();
  const [isPlanningOpen, setIsPlanningOpen] = useState(false);
  const [isStudiesOpen, setIsStudiesOpen] = useState(false);
  const [isFacultyOpen, setIsFacultyOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);

  // Close all accordion dropdowns whenever changing screens / routes
  useEffect(() => {
    setIsPlanningOpen(false);
    setIsStudiesOpen(false);
    setIsFacultyOpen(false);
    setIsProjectsOpen(false);
  }, [pathname]);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname === path || (path !== '/' && pathname.startsWith(path));
  };

  // Check if we are inside a specific project (/projetos/[id])
  const projectMatch = pathname.match(/^\/projetos\/([^/]+)/);
  const activeProjectId = projectMatch && projectMatch[1] !== 'meus' ? projectMatch[1] : null;

  const navItems = [
    { label: 'Início', href: '/', icon: Home },
    { label: 'Pomodoro', href: '/pomodoro', icon: Timer },
    { label: 'Tarefas', href: '/tarefas', icon: CheckSquare },
    { label: 'Calendário', href: '/calendario', icon: Calendar },
  ];

  const projectsSubItems = [
    { label: 'Visão geral', href: '/projetos' },
    { label: 'Meus projetos', href: '/projetos/meus' },
  ];

  const currentProjectTabs = activeProjectId
    ? [
        { label: 'Visão geral', href: `/projetos/${activeProjectId}`, icon: LayoutGrid },
        { label: 'Kanban', href: `/projetos/${activeProjectId}/kanban`, icon: FolderKanban },
        { label: 'Notas', href: `/projetos/${activeProjectId}/notas`, icon: FileText },
        { label: 'Documentação', href: `/projetos/${activeProjectId}/documentacao`, icon: BookOpen },
        { label: 'Objetivos', href: `/projetos/${activeProjectId}/objetivos`, icon: Target },
        { label: 'Timeline', href: `/projetos/${activeProjectId}/timeline`, icon: Clock },
        { label: 'Arquivos', href: `/projetos/${activeProjectId}/arquivos`, icon: Paperclip },
        { label: 'Relatórios', href: `/projetos/${activeProjectId}/relatorios`, icon: BarChart2 },
      ]
    : [];

  const studiesSubItems = [
    { label: 'Visão geral', href: '/estudos' },
    { label: 'Matérias', href: '/estudos/materias' },
    { label: 'Conteúdos', href: '/estudos/conteudos' },
    { label: 'Anotações', href: '/estudos/anotacoes' },
    { label: 'Revisões', href: '/estudos/revisoes' },
    { label: 'Metas', href: '/estudos/metas' },
  ];

  const facultySubItems = [
    { label: 'Minha faculdade', href: '/estudos/faculdade' },
    { label: 'Semestre atual', href: '/estudos/faculdade/semestre' },
    { label: 'Disciplinas', href: '/estudos/faculdade/disciplinas' },
    { label: 'Avaliações', href: '/estudos/faculdade/avaliacoes' },
    { label: 'Trabalhos & entregas', href: '/estudos/faculdade/trabalhos' },
    { label: 'Arquivos & links', href: '/estudos/faculdade/arquivos' },
    { label: 'Calendário acadêmico', href: '/estudos/faculdade/calendario' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Main Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-[var(--bg-surface)] border-r border-[var(--border-color)] flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6 overflow-y-auto pr-1">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 pt-2">
            <Link
              href="/"
              onClick={onCloseMobile}
              className="flex items-center gap-3 group"
            >
              <img
                src="/logo.png"
                alt="DevDock Logo"
                className="w-8 h-8 object-contain group-hover:scale-105 transition-transform"
              />
              <div>
                <span className="text-lg font-extrabold tracking-tight text-[var(--text-primary)] block leading-none">
                  DevDock
                </span>
                <span className="text-[10px] text-[var(--text-tertiary)] font-medium tracking-wider uppercase">
                  Plataforma de Foco
                </span>
              </div>
            </Link>

            {/* Close Button on Mobile */}
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] lg:hidden"
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                    active
                      ? 'bg-[var(--bg-card-elevated)] text-[var(--text-primary)] border border-[var(--border-color)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[var(--text-secondary)]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* PROJETOS Accordion Group */}
            <div className="space-y-1 pt-1">
              <button
                onClick={() => setIsProjectsOpen(!isProjectsOpen)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  pathname.startsWith('/projetos')
                    ? 'text-[var(--text-primary)] bg-[var(--bg-card-elevated)] border border-[var(--border-color)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FolderKanban className="w-4 h-4 text-[var(--text-secondary)]" />
                  <span>Projetos</span>
                </div>
                {isProjectsOpen ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>

              {isProjectsOpen && (
                <div className="pl-4 space-y-1 border-l-2 border-[var(--border-color)] ml-4 my-1">
                  {projectsSubItems.map((sub) => {
                    const isSubActive =
                      sub.href === '/projetos'
                        ? pathname === '/projetos'
                        : pathname.startsWith(sub.href);
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={onCloseMobile}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isSubActive && !activeProjectId
                            ? 'bg-[var(--bg-card-elevated)] text-[var(--text-primary)] font-bold border border-[var(--border-color)] shadow-sm'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSubActive && !activeProjectId ? 'bg-[var(--text-primary)]' : 'bg-[var(--text-tertiary)]'
                          }`}
                        />
                        <span>{sub.label}</span>
                      </Link>
                    );
                  })}

                  {/* Active Project Selected Subnavigation */}
                  {activeProjectId && (
                    <div className="pt-2 mt-2 border-t border-[var(--border-color)] space-y-1">
                      <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider px-2">
                        Projeto Atual
                      </p>
                      {currentProjectTabs.map((tab) => {
                        const isTabActive = pathname === tab.href;
                        const Icon = tab.icon;
                        return (
                          <Link
                            key={tab.href}
                            href={tab.href}
                            onClick={onCloseMobile}
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
                              isTabActive
                                ? 'bg-[var(--bg-card-elevated)] text-[var(--text-primary)] font-bold border border-[var(--border-color)]'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                            <span>{tab.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ESTUDOS Accordion Group */}
            <div className="space-y-1 pt-1">
              <button
                onClick={() => setIsStudiesOpen(!isStudiesOpen)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  pathname === '/estudos' || (pathname.startsWith('/estudos') && !pathname.startsWith('/estudos/faculdade'))
                    ? 'text-[var(--text-primary)] bg-[var(--bg-card-elevated)] border border-[var(--border-color)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-[var(--text-secondary)]" />
                  <span>Estudos</span>
                </div>
                {isStudiesOpen ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>

              {isStudiesOpen && (
                <div className="pl-4 space-y-1 border-l-2 border-[var(--border-color)] ml-4 my-1">
                  {studiesSubItems.map((sub) => {
                    const isSubActive =
                      sub.href === '/estudos'
                        ? pathname === '/estudos'
                        : pathname.startsWith(sub.href);
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={onCloseMobile}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isSubActive
                            ? 'bg-[var(--bg-card-elevated)] text-[var(--text-primary)] font-bold border border-[var(--border-color)] shadow-sm'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSubActive ? 'bg-[var(--text-primary)]' : 'bg-[var(--text-tertiary)]'
                          }`}
                        />
                        <span>{sub.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* FACULDADE Accordion Group */}
            <div className="space-y-1 pt-1">
              <button
                onClick={() => setIsFacultyOpen(!isFacultyOpen)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  pathname.startsWith('/estudos/faculdade')
                    ? 'text-[var(--text-primary)] bg-[var(--bg-card-elevated)] border border-[var(--border-color)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-4 h-4 text-[var(--text-secondary)]" />
                  <span>Faculdade</span>
                </div>
                {isFacultyOpen ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>

              {isFacultyOpen && (
                <div className="pl-4 space-y-1 border-l-2 border-[var(--border-color)] ml-4 my-1">
                  {facultySubItems.map((sub) => {
                    const isSubActive =
                      sub.href === '/estudos/faculdade'
                        ? pathname === '/estudos/faculdade'
                        : pathname.startsWith(sub.href);
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={onCloseMobile}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isSubActive
                            ? 'bg-[var(--bg-card-elevated)] text-[var(--text-primary)] font-bold border border-[var(--border-color)] shadow-sm'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSubActive ? 'bg-[var(--text-primary)]' : 'bg-[var(--text-tertiary)]'
                          }`}
                        />
                        <span>{sub.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Relatórios */}
            <Link
              href="/relatorios"
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                isActive('/relatorios')
                  ? 'bg-[var(--bg-card-elevated)] text-[var(--text-primary)] border border-[var(--border-color)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
              }`}
            >
              <BarChart2 className="w-4 h-4 text-[var(--text-secondary)]" />
              <span>Relatórios</span>
            </Link>

            {/* Configurações */}
            <Link
              href="/configuracoes"
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                isActive('/configuracoes')
                  ? 'bg-[var(--bg-card-elevated)] text-[var(--text-primary)] border border-[var(--border-color)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
              }`}
            >
              <Settings className="w-4 h-4 text-[var(--text-secondary)]" />
              <span>Configurações</span>
            </Link>
          </nav>
        </div>

        {/* PWA Installation Footer Button */}
        {canInstall && (
          <div className="p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 mt-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
              <Download className="w-4 h-4 text-[var(--text-secondary)]" />
              <span>Instalar App</span>
            </div>
            <p className="text-[10px] text-[var(--text-tertiary)] leading-tight">
              Instale o DevDock no computador ou celular para uso rápido offline.
            </p>
            <button
              onClick={() => {
                promptInstall();
                if (onCloseMobile) onCloseMobile();
              }}
              className="btn-primary w-full py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar agora</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
