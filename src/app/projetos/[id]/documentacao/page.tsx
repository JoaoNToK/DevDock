'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { useProjects } from '@/hooks/useProjects';
import { BookOpen, Save, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ProjectDocPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const { isMounted, projects, docs, updateDoc } = useProjects();

  const project = projects.find((p) => p.id === projectId);
  const projDoc = docs.find((d) => d.projectId === projectId);

  const [title, setTitle] = useState('Documentação Técnica & Arquitetura');
  const [content, setContent] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (projDoc) {
      setTitle(projDoc.title || 'Documentação Técnica & Arquitetura');
      setContent(projDoc.content || '');
    } else if (project) {
      setContent(
        `# ${project.name}\n\n## 🚀 Visão Geral\n${project.description || 'Descrição do projeto...'}\n\n## 🛠 Stack Tecnológica\n- Next.js 15\n- TypeScript\n- Tailwind CSS\n- PostgreSQL / Prisma\n\n## 📐 Arquitetura & Decisões Técnicas\nDescreva a estrutura de pastas, convenções e rotas.`
      );
    }
  }, [projDoc, project]);

  const handleSave = () => {
    updateDoc(projectId, content, title);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
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
                <h2 className="text-xl font-extrabold text-primary-theme">Documentação Técnica — {project.name}</h2>
              </div>
              <p className="text-xs text-secondary-theme font-medium">Editor de documentação, especificações e decisões de arquitetura</p>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="btn-primary py-2.5 px-5 rounded-2xl font-bold text-xs shadow-lg flex items-center gap-1.5"
          >
            {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Documentação Salva!' : 'Salvar Alterações'}</span>
          </button>
        </div>

        {/* Editor Area */}
        <div className="p-6 rounded-3xl theme-surface border space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-secondary-theme block">Título do Documento</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-2xl theme-card border text-primary-theme text-xs font-bold focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-secondary-theme block">Conteúdo em Markdown / Texto</label>
            <textarea
              rows={16}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-4 rounded-2xl theme-card border text-primary-theme font-mono text-xs placeholder-zinc-500 focus:outline-none leading-relaxed resize-y"
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
