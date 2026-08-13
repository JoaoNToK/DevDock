'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { useProjects } from '@/hooks/useProjects';
import { Clock, ArrowLeft } from 'lucide-react';

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
          <div className="w-8 h-8 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (!project) {
    return (
      <MainLayout>
        <div className="p-8 text-center text-zinc-400">Projeto não encontrado.</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Link
              href={`/projetos/${project.id}`}
              className="p-2 rounded-2xl bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h2 className="text-xl font-extrabold text-white">Timeline &amp; Histórico — {project.name}</h2>
              <p className="text-xs text-zinc-400 font-medium">Feed cronológico de atividades e eventos do projeto</p>
            </div>
          </div>
        </div>

        {/* Timeline Events List */}
        <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4">
          {projEvents.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              Nenhuma atividade registrada na timeline do projeto.
            </div>
          ) : (
            <div className="space-y-4 relative border-l-2 border-zinc-800 pl-4 ml-2">
              {projEvents.map((evt) => (
                <div key={evt.id} className="relative space-y-1">
                  <span className="w-3 h-3 rounded-full bg-cyan-500 absolute -left-[23px] top-1 border-2 border-zinc-950" />
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">{evt.date}</span>
                  <h4 className="font-bold text-white text-sm">{evt.title}</h4>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
