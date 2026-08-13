'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { useProjects } from '@/hooks/useProjects';
import { BookOpen, Save, ArrowLeft } from 'lucide-react';

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
          <div className="w-8 h-8 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
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
              <h2 className="text-xl font-extrabold text-white">Documentação Técnica — {project.name}</h2>
              <p className="text-xs text-zinc-400 font-medium">Editor de documentação, especificações e decisões de arquitetura</p>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="py-2.5 px-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{isSaved ? '✅ Salvo!' : 'Salvar Alterações'}</span>
          </button>
        </div>

        {/* Editor Area */}
        <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300 block">Título do Documento</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full py-2.5 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300 block">Conteúdo em Markdown / Texto</label>
            <textarea
              rows={16}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-white font-mono text-xs placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed resize-y"
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
