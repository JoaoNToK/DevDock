'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { useProjects } from '@/hooks/useProjects';
import { ProjectResource } from '@/types/projects';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import {
  Paperclip,
  Plus,
  ExternalLink,
  Trash2,
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  Upload,
  Download,
  Eye,
  X,
  AlertTriangle,
} from 'lucide-react';

import { uploadFileToCloudAction } from '@/app/actions/storageActions';

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

  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('data:') && !/^https?:\/\//i.test(formattedUrl)) {
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImg = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    const cat = isImg ? 'design' : isPdf ? 'pdf' : 'document';

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    const res = await uploadFileToCloudAction(formData);

    if (res.success && res.url) {
      const providerLabel = res.storageProvider === 'supabase' || res.storageProvider === 's3' ? '☁️ Nuvem' : '💾 Local';
      addResource({
        projectId,
        category: cat,
        name: file.name,
        url: res.url,
        description: `Arquivo ${providerLabel} (${((file.size || 0) / 1024).toFixed(1)} KB)`,
      });
    } else if (res.error) {
      alert(`⚠️ Erro ao enviar arquivo: ${res.error}`);
    }
    setIsUploading(false);
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
                <MaterialIcon name={project.icon || 'rocket_launch'} size={20} />
                <h2 className="text-xl font-extrabold text-primary-theme">Arquivos &amp; Links — {project.name}</h2>
              </div>
              <p className="text-xs text-secondary-theme font-medium">
                Upload de arquivos, documentos, links externos e repositórios do projeto
              </p>
            </div>
          </div>

          <label className="btn-primary py-2.5 px-4 rounded-2xl text-xs flex items-center gap-2 cursor-pointer shadow-md">
            <Upload className="w-4 h-4" />
            <span>Fazer Upload de Arquivo</span>
            <input type="file" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {/* Add Resource Form */}
        <div className="p-6 rounded-3xl theme-surface border space-y-4">
          <h3 className="text-sm font-bold text-primary-theme flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-primary-theme" />
            <span>Adicionar Novo Recurso / Link</span>
          </h3>

          <form onSubmit={handleAddResource} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <input
              type="text"
              required
              placeholder="Ex: Repositório GitHub, Figma, Vercel..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="py-2.5 px-3.5 rounded-2xl theme-card border text-primary-theme placeholder-zinc-500 focus:outline-none"
            />
            <input
              type="text"
              required
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="py-2.5 px-3.5 rounded-2xl theme-card border text-primary-theme placeholder-zinc-500 font-mono focus:outline-none"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProjectResource['category'])}
              className="py-2.5 px-3 rounded-2xl theme-card border text-primary-theme focus:outline-none"
            >
              <option value="repo">Repositório</option>
              <option value="design">Design (Figma)</option>
              <option value="document">Documento</option>
              <option value="link">Link Externo</option>
            </select>
            <button
              type="submit"
              className="btn-primary py-2.5 px-4 rounded-2xl font-bold shadow-md flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Salvar Recurso</span>
            </button>
          </form>
        </div>

        {/* Resources Grid */}
        {projResources.length === 0 ? (
          <div className="p-12 text-center text-xs text-tertiary-theme theme-surface rounded-3xl border">
            Nenhum link ou arquivo cadastrado neste projeto ainda.
          </div>
        ) : (
          <div className="space-y-3">
            {projResources.map((res) => {
              const isDataUrl = res.url.startsWith('data:');
              const isImage = res.url.startsWith('data:image/');

              return (
                <div
                  key={res.id}
                  className="p-4 rounded-2xl theme-card border flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    {isImage ? (
                      <ImageIcon className="w-5 h-5 text-primary-theme shrink-0" />
                    ) : (
                      <Paperclip className="w-5 h-5 text-secondary-theme shrink-0" />
                    )}
                    <div>
                      {isDataUrl ? (
                        <span className="font-bold text-primary-theme text-sm">{res.name}</span>
                      ) : (
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-primary-theme hover:underline flex items-center gap-1.5 text-sm"
                        >
                          <span>{res.name}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {res.description && (
                        <p className="text-[11px] text-secondary-theme mt-0.5">{res.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isImage && (
                      <button
                        type="button"
                        onClick={() => setPreviewFileUrl(res.url)}
                        className="btn-secondary p-2 rounded-xl text-xs flex items-center gap-1"
                        title="Visualizar imagem"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Preview</span>
                      </button>
                    )}

                    {isDataUrl && (
                      <a
                        href={res.url}
                        download={res.name}
                        className="btn-secondary p-2 rounded-xl text-xs flex items-center gap-1"
                        title="Baixar arquivo"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Baixar</span>
                      </a>
                    )}

                    {deletingId === res.id ? (
                      <div className="flex items-center gap-1 animate-fade-in">
                        <button
                          type="button"
                          onClick={() => {
                            deleteResource(res.id);
                            setDeletingId(null);
                          }}
                          className="px-2 py-1 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold"
                        >
                          Excluir
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(null)}
                          className="btn-secondary px-2 py-1 rounded-xl text-[10px]"
                        >
                          X
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeletingId(res.id)}
                        className="p-1.5 text-tertiary-theme hover:text-red-400"
                        title="Excluir arquivo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Image Preview Modal */}
        {previewFileUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="max-w-2xl w-full p-4 rounded-3xl theme-surface border relative text-center space-y-4">
              <button
                onClick={() => setPreviewFileUrl(null)}
                className="absolute top-4 right-4 p-2 rounded-xl theme-card text-secondary-theme hover:text-primary-theme"
              >
                <X className="w-5 h-5" />
              </button>
              <img src={previewFileUrl} alt="Preview" className="max-h-[70vh] w-auto mx-auto rounded-2xl object-contain" />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
