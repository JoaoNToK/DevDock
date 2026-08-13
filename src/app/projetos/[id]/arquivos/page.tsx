'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { useProjects } from '@/hooks/useProjects';
import { Paperclip, Plus, ExternalLink, Trash2, ArrowLeft } from 'lucide-react';

export default function ProjectResourcesPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const { isMounted, projects, resources, addResource, deleteResource } = useProjects();

  const project = projects.find((p) => p.id === projectId);
  const projResources = resources.filter((r) => r.projectId === projectId);

  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'document' | 'link' | 'design' | 'pdf' | 'repo'>('repo');

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    addResource({
      projectId,
      category,
      name: name.trim(),
      url: formattedUrl,
      description: description.trim(),
    });

    setName('');
    setUrl('');
    setDescription('');
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
              <h2 className="text-xl font-extrabold text-white">Arquivos &amp; Links — {project.name}</h2>
              <p className="text-xs text-zinc-400 font-medium">Repositórios, Figma, links externos e documentos do projeto</p>
            </div>
          </div>
        </div>

        {/* Add Resource Form */}
        <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-cyan-400" />
            <span>Adicionar Novo Recurso / Link</span>
          </h3>

          <form onSubmit={handleAddResource} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <input
              type="text"
              required
              placeholder="Ex: GitHub, Figma, Vercel..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="py-2.5 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <input
              type="text"
              required
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="py-2.5 px-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="py-2.5 px-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="repo">💻 Repositório</option>
              <option value="design">🎨 Design (Figma)</option>
              <option value="document">📁 Documento</option>
              <option value="link">🔗 Link Externo</option>
            </select>
            <button
              type="submit"
              className="py-2.5 px-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Salvar Link</span>
            </button>
          </form>
        </div>

        {/* Resources Grid */}
        {projResources.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500 bg-zinc-900/40 rounded-3xl border border-zinc-800">
            Nenhum link ou recurso cadastrado no projeto.
          </div>
        ) : (
          <div className="space-y-3">
            {projResources.map((res) => (
              <div
                key={res.id}
                className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs"
              >
                <div>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-cyan-400 hover:underline flex items-center gap-1.5 text-sm"
                  >
                    <span>{res.name}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  {res.description && <p className="text-[11px] text-zinc-400 mt-0.5">{res.description}</p>}
                </div>
                <button
                  onClick={() => deleteResource(res.id)}
                  className="p-1.5 text-zinc-500 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
