'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { useProjects } from '@/hooks/useProjects';
import { Target, Plus, Trash2, ArrowLeft } from 'lucide-react';

export default function ProjectGoalsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const { isMounted, projects, goals, addGoal, deleteGoal } = useProjects();

  const project = projects.find((p) => p.id === projectId);
  const projGoals = goals.filter((g) => g.projectId === projectId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [progressPct, setProgressPct] = useState(50);

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addGoal({
      projectId,
      title: title.trim(),
      description: description.trim(),
      status: 'in_progress',
      progressPct: Math.min(100, Math.max(0, Number(progressPct) || 0)),
    });

    setTitle('');
    setDescription('');
  };

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
                <span className="text-xl">{project.icon || '🚀'}</span>
                <h2 className="text-xl font-extrabold text-primary-theme">Objetivos &amp; Milestones — {project.name}</h2>
              </div>
              <p className="text-xs text-secondary-theme font-medium">Defina marcos importantes e meça o avanço do projeto</p>
            </div>
          </div>
        </div>

        {/* Add Goal Form */}
        <div className="p-6 rounded-3xl theme-surface border space-y-4">
          <h3 className="text-sm font-bold text-primary-theme flex items-center gap-2">
            <Target className="w-4 h-4 text-primary-theme" />
            <span>Cadastrar Novo Objetivo / Milestone</span>
          </h3>

          <form onSubmit={handleAddGoal} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <input
              type="text"
              required
              placeholder="Ex: Lançar MVP, Finalizar Frontend..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="py-2.5 px-3.5 rounded-2xl theme-card border text-primary-theme placeholder-zinc-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Descrição do marco..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="py-2.5 px-3.5 rounded-2xl theme-card border text-primary-theme placeholder-zinc-500 focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <span className="text-secondary-theme font-mono">{progressPct}%</span>
              <input
                type="range"
                min={0}
                max={100}
                value={progressPct}
                onChange={(e) => setProgressPct(Number(e.target.value))}
                className="w-full accent-[var(--btn-primary-bg)]"
              />
            </div>
            <button
              type="submit"
              className="btn-primary py-2.5 px-4 rounded-2xl font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Objetivo</span>
            </button>
          </form>
        </div>

        {/* Goals List */}
        {projGoals.length === 0 ? (
          <div className="p-12 text-center text-xs text-tertiary-theme theme-surface rounded-3xl border">
            Nenhum objetivo cadastrado neste projeto ainda.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projGoals.map((goal) => (
              <div
                key={goal.id}
                className="p-6 rounded-3xl theme-surface border space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-primary-theme">{goal.title}</h3>
                    {goal.description && <p className="text-xs text-secondary-theme mt-0.5">{goal.description}</p>}
                  </div>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="p-1.5 text-tertiary-theme hover:text-red-400"
                    title="Excluir objetivo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5 pt-2 border-t text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-theme">Progresso</span>
                    <span className="text-primary-theme font-bold">{goal.progressPct}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full theme-card overflow-hidden border p-0.5">
                    <div
                      className="h-full rounded-full bg-[var(--text-primary)] transition-all duration-500"
                      style={{ width: `${goal.progressPct}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
