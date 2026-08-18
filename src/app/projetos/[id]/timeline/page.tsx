'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { useProjects } from '@/hooks/useProjects';
import { Clock, ArrowLeft, CheckCircle2, FileText, PlusCircle, Target } from 'lucide-react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';

export default function ProjectTimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const { isMounted, projects, timeline } = useProjects();

  const project = projects.find((p) => p.id === projectId);
  const projEvents = timeline.filter((tm) => tm.projectId === projectId);

  if (!isMounted) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="w-8 h-8 rounded-full border-4 border-[var(--border-color)] border-t-[var(--text-primary)] animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (!project) {
    return (
      <MainLayout>
        <div className="p-8 text-center text-secondary-theme space-y-4">
          <p>Projeto não encontrado.</p>
          <Link href="/projetos" className="btn-primary py-2 px-4 rounded-xl text-xs inline-block">
            Voltar para Projetos
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-3xl theme-surface border backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Link
              href={`/projetos/${project.id}`}
              className="p-2 rounded-2xl theme-card text-secondary-theme hover:text-primary-theme transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <MaterialIcon name={project.icon || 'rocket_launch'} size={20} />
                <h2 className="text-xl font-extrabold text-primary-theme">Timeline &amp; Histórico — {project.name}</h2>
              </div>
              <p className="text-xs text-secondary-theme font-medium">Feed cronológico de atividades e acontecimentos reais do projeto</p>
            </div>
          </div>
        </div>

        {/* Timeline Events List */}
        <div className="p-6 rounded-3xl theme-surface border space-y-4">
          {projEvents.length === 0 ? (
            <div className="p-8 text-center text-xs text-tertiary-theme">
              Nenhuma atividade registrada na timeline do projeto. As atividades aparecem automaticamente ao criar/concluir tarefas ou documentos.
            </div>
          ) : (
            <div className="space-y-6 relative border-l-2 border-[var(--border-color)] pl-6 ml-3 py-2">
              {projEvents.map((evt) => {
                const isTaskDone = evt.type === 'task_done';
                const isCreated = evt.type === 'created';

                return (
                  <div key={evt.id} className="relative space-y-1 group">
                    <span
                      className={`w-3.5 h-3.5 rounded-full absolute -left-[31px] top-1 border-2 border-[var(--bg-surface)] ${
                        isTaskDone
                          ? 'bg-primary-theme'
                          : isCreated
                          ? 'bg-secondary-theme'
                          : 'bg-tertiary-theme'
                      }`}
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-tertiary-theme font-bold">{evt.date}</span>
                      <span className="px-2 py-0.5 rounded-full theme-card-elevated border text-[9px] font-mono text-secondary-theme uppercase">
                        {evt.type}
                      </span>
                    </div>
                    <h4 className="font-bold text-primary-theme text-sm">{evt.title}</h4>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
