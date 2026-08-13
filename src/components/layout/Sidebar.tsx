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
        { label: 'Tarefas', href: `/projetos/${activeProjectId}/tarefas`, icon: CheckSquare },
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
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-zinc-950 border-r border-zinc-800/80 flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6 overflow-y-auto pr-1">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 pt-2">
            <Link
              href="/"
              onClick={onCloseMobile}
              className="flex items-center gap-2.5 group"
            >
              <div className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800/80 shadow-md shadow-indigo-500/10 group-hover:scale-105 transition-transform overflow-hidden flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="DevDock Logo"
                  className="w-7 h-7 object-contain rounded-lg"
                />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight text-white block leading-none">
                  DevDock
                </span>
                <span className="text-[10px] text-zinc-500 font-medium tracking-wider uppercase">
                  Plataforma de Foco
                </span>
              </div>
            </Link>

            {/* Close Button on Mobile */}
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 lg:hidden"
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
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
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
                    ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-800/40'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FolderKanban className="w-4 h-4 text-cyan-400" />
                  <span>Projetos</span>
                </div>
                {isProjectsOpen ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>

              {isProjectsOpen && (
                <div className="pl-4 space-y-1 border-l-2 border-zinc-800/80 ml-4 my-1">
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
                            ? 'bg-zinc-800 text-cyan-400 font-bold shadow-sm'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSubActive && !activeProjectId ? 'bg-cyan-400' : 'bg-zinc-600'
                          }`}
                        />
                        <span>{sub.label}</span>
                      </Link>
                    );
                  })}

                  {/* Active Project Selected Subnavigation */}
                  {activeProjectId && (
                    <div className="pt-2 mt-2 border-t border-zinc-800/80 space-y-1">
                      <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider px-2">
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
                                ? 'bg-cyan-600 text-white font-bold shadow-md'
                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
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
                    ? 'text-indigo-400 bg-indigo-950/40 border border-indigo-800/40'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span>Estudos</span>
                </div>
                {isStudiesOpen ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>

              {isStudiesOpen && (
                <div className="pl-4 space-y-1 border-l-2 border-zinc-800/80 ml-4 my-1">
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
                            ? 'bg-zinc-800 text-indigo-400 font-bold shadow-sm'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSubActive ? 'bg-indigo-400' : 'bg-zinc-600'
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
                    ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/40'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  <span>Faculdade</span>
                </div>
                {isFacultyOpen ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>

              {isFacultyOpen && (
                <div className="pl-4 space-y-1 border-l-2 border-zinc-800/80 ml-4 my-1">
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
                            ? 'bg-zinc-800 text-emerald-400 font-bold shadow-sm'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSubActive ? 'bg-emerald-400' : 'bg-zinc-600'
                          }`}
                        />
                        <span>{sub.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Planejamento Accordion Group */}
            <div className="space-y-1 pt-1">
              <button
                onClick={() => setIsPlanningOpen(!isPlanningOpen)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  pathname.startsWith('/planejamento')
                    ? 'text-indigo-400 bg-indigo-950/40 border border-indigo-800/40'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ClipboardList className="w-4 h-4 text-purple-400" />
                  <span>Planejamento</span>
                </div>
                {isPlanningOpen ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>

              {isPlanningOpen && (
                <div className="pl-4 space-y-1 border-l-2 border-zinc-800/80 ml-4 my-1">
                  <Link
                    href="/planejamento/diario"
                    onClick={onCloseMobile}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      pathname === '/planejamento/diario'
                        ? 'bg-zinc-800 text-indigo-400 font-bold'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span>Diário</span>
                  </Link>

                  <Link
                    href="/planejamento/semanal"
                    onClick={onCloseMobile}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      pathname === '/planejamento/semanal'
                        ? 'bg-zinc-800 text-indigo-400 font-bold'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span>Semanal</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Relatórios */}
            <Link
              href="/relatorios"
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                isActive('/relatorios')
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Relatórios</span>
            </Link>

            {/* Configurações */}
            <Link
              href="/configuracoes"
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                isActive('/configuracoes')
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Configurações</span>
            </Link>
          </nav>
        </div>

        {/* PWA Installation Footer Button */}
        {canInstall && (
          <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2 mt-4">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Instalar App</span>
            </div>
            <p className="text-[10px] text-zinc-400 leading-tight">
              Instale o DevDock no computador ou celular para uso rápido offline.
            </p>
            <button
              onClick={() => {
                promptInstall();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
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
