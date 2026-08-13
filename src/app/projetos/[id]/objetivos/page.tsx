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
      progressPct: Number(progressPct) || 0,
    });

    setTitle('');
    setDescription('');
  };

  if (!isMounted) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
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
              <h2 className="text-xl font-extrabold text-white">Objetivos &amp; Milestones — {project.name}</h2>
              <p className="text-xs text-zinc-400 font-medium">Defina marcos importantes e meça o avanço do projeto</p>
            </div>
          </div>
        </div>

        {/* Add Goal Form */}
        <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>Cadastrar Novo Objetivo / Milestone</span>
          </h3>

          <form onSubmit={handleAddGoal} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <input
              type="text"
              required
              placeholder="Ex: Lançar MVP, Finalizar Frontend..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="py-2.5 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="text"
              placeholder="Descrição do marco..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="py-2.5 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 font-mono">{progressPct}%</span>
              <input
                type="range"
                min={0}
                max={100}
                value={progressPct}
                onChange={(e) => setProgressPct(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Objetivo</span>
            </button>
          </form>
        </div>

        {/* Goals List */}
        {projGoals.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500 bg-zinc-900/40 rounded-3xl border border-zinc-800">
            Nenhum objetivo cadastrado.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projGoals.map((goal) => (
              <div
                key={goal.id}
                className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">{goal.title}</h3>
                    {goal.description && <p className="text-xs text-zinc-400 mt-0.5">{goal.description}</p>}
                  </div>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="p-1.5 text-zinc-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-zinc-800/80 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Progresso</span>
                    <span className="text-emerald-400 font-bold">{goal.progressPct}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800 p-0.5">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
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
