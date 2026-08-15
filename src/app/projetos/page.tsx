'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { useProjects } from '@/hooks/useProjects';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProjectModal } from '@/components/projects/ProjectModal';
import { Project, ProjectStatus } from '@/types/projects';
import {
  FolderKanban,
  Plus,
  Search,
  Grid,
  List,
  Clock,
  CheckCircle2,
  ArrowRight,
  Pencil,
  Archive,
} from 'lucide-react';

export default function ProjetosOverviewPage() {
  const {
    isMounted,
    projects,
    tasks,
    columns,
    getProjectProgress,
    addProject,
    updateProject,
    toggleArchiveProject,
    deleteProject,
  } = useProjects();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  const filteredProjects = projects.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q));
    }
    return true;
  });

  const handleOpenAdd = () => {
    setProjectToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Project) => {
    setProjectToEdit(p);
    setIsModalOpen(true);
  };

  const handleSaveModal = (data: Omit<Project, 'id' | 'totalFocusMinutes' | 'isArchived' | 'createdAt'>) => {
    if (projectToEdit) {
      updateProject(projectToEdit.id, data);
    } else {
      addProject(data);
    }
  };

  if (!isMounted) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="w-8 h-8 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
        </div>
      </MainLayout>
    );
  }

  const activeProjectsCount = projects.filter((p) => p.status === 'active').length;
  const totalFocusHours = (projects.reduce((sum, p) => sum + p.totalFocusMinutes, 0) / 60).toFixed(1);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Banner Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-cyan-950/80 via-zinc-900 to-zinc-900 border border-cyan-500/20 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl z-10">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 inline-flex items-center gap-1">
              <FolderKanban className="w-3.5 h-3.5 text-cyan-400" />
              <span>Project Hub &amp; Gerenciador de Projetos</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Meus Projetos
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Gerencie seus projetos com Kanban interativo, listas de tarefas, documentação técnica, timeline e registros de Pomodoro.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="py-3 px-5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 z-10"
          >
            <Plus className="w-4 h-4" />
            <span>+ Novo Projeto</span>
          </button>
        </div>

        {/* Search & Controls Filter Bar */}
        <div className="p-4 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80 flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Pesquisar projetos por nome ou descrição..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2.5 pl-10 pr-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Status Filters & Grid/List Toggle */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold"
            >
              <option value="all">Todos os Status</option>
              <option value="active">🟢 Ativos ({activeProjectsCount})</option>
              <option value="paused">🟡 Em Pausa</option>
              <option value="planning">🔵 Planejamento</option>
              <option value="completed">✅ Concluídos</option>
            </select>

            <div className="flex items-center gap-1 p-1 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-400">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === 'grid' ? 'bg-zinc-800 text-cyan-400' : 'hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === 'list' ? 'bg-zinc-800 text-cyan-400' : 'hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Projects Cards Container */}
        {filteredProjects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title={projects.length === 0 ? 'Nenhum projeto criado ainda' : 'Nenhum projeto encontrado'}
            description={
              projects.length === 0
                ? 'Crie seu primeiro projeto para organizar seu Kanban, tarefas, documentos, metas e registros de foco.'
                : 'Não encontramos projetos que correspondam aos filtros de busca aplicados.'
            }
            actionLabel={projects.length === 0 ? '+ Criar Novo Projeto' : undefined}
            onAction={projects.length === 0 ? handleOpenAdd : undefined}
            secondaryActionLabel={projects.length > 0 ? 'Limpar Filtros' : undefined}
            onSecondaryAction={
              projects.length > 0
                ? () => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }
                : undefined
            }
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((proj) => {
              const pct = getProjectProgress(proj.id);
              const projTasks = tasks.filter((t) => t.projectId === proj.id);
              const completedTasks = projTasks.filter((t) => {
                const doneCol = columns.find((c) => c.id === t.columnId && c.name.toUpperCase() === 'CONCLUÍDO');
                return doneCol || t.completedAt;
              }).length;
              const hoursFocussed = (proj.totalFocusMinutes / 60).toFixed(1);

              return (
                <div
                  key={proj.id}
                  className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4 flex flex-col justify-between hover:border-zinc-700 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{proj.icon || '🚀'}</span>
                        <div>
                          <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                            {proj.name}
                          </h3>
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase inline-block mt-0.5"
                            style={{ backgroundColor: proj.color }}
                          >
                            {proj.status === 'active'
                              ? '🟢 Ativo'
                              : proj.status === 'paused'
                              ? '🟡 Em Pausa'
                              : proj.status === 'completed'
                              ? '✅ Concluído'
                              : '🔵 Planejamento'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenEdit(proj)}
                        className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>

                    {proj.description && (
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{proj.description}</p>
                    )}

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-xs font-bold font-mono">
                        <span className="text-zinc-400">Progresso</span>
                        <span className="text-cyan-400">{pct}%</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-zinc-950 overflow-hidden p-0.5 border border-zinc-800">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: proj.color }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold pt-2 border-t border-zinc-800/80">
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{completedTasks}/{projTasks.length} tarefas</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-400 font-mono">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{hoursFocussed}h focadas</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/projetos/${proj.id}`}
                    className="w-full py-2.5 px-4 rounded-2xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-bold transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    <span>Abrir Projeto</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProjects.map((proj) => {
              const pct = getProjectProgress(proj.id);
              const projTasks = tasks.filter((t) => t.projectId === proj.id);
              return (
                <div
                  key={proj.id}
                  className="p-4 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl flex items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{proj.icon || '🚀'}</span>
                    <div>
                      <h4 className="font-bold text-white text-sm">{proj.name}</h4>
                      <p className="text-[11px] text-zinc-400 line-clamp-1">{proj.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="font-mono text-cyan-400 font-bold">{pct}%</span>
                    <span className="text-zinc-400">{projTasks.length} tarefas</span>
                    <Link
                      href={`/projetos/${proj.id}`}
                      className="py-1.5 px-3 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold flex items-center gap-1"
                    >
                      <span>Abrir</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <ProjectModal
          isOpen={isModalOpen}
          projectToEdit={projectToEdit}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveModal}
          onDelete={deleteProject}
        />
      </div>
    </MainLayout>
  );
}
