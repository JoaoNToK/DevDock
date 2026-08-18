'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAcademic } from '@/hooks/useAcademic';
import { AcademicLink, AcademicAttachmentFile, AcademicResourceType } from '@/types/academic';
import { uploadFileToCloudAction } from '@/app/actions/storageActions';
import {
  Paperclip,
  Plus,
  ExternalLink,
  Trash2,
  ArrowLeft,
  FileText,
  Upload,
  Download,
  Search,
  Pencil,
  AlertTriangle,
  FolderKanban,
  GraduationCap,
  BookOpen,
  Link2,
} from 'lucide-react';

import { MaterialIcon } from '@/components/ui/MaterialIcon';

const RESOURCE_TYPES: { key: AcademicResourceType; label: string; icon: string }[] = [
  { key: 'repo', label: 'Repositório GitHub / GitLab', icon: 'computer' },
  { key: 'drive', label: 'Google Drive', icon: 'cloud' },
  { key: 'docs', label: 'Google Docs', icon: 'description' },
  { key: 'sheets', label: 'Google Sheets', icon: 'table_chart' },
  { key: 'slides', label: 'Google Slides', icon: 'slideshow' },
  { key: 'moodle', label: 'Moodle', icon: 'school' },
  { key: 'ava', label: 'Portal AVA / EAD', icon: 'language' },
  { key: 'site', label: 'Site / Link Externo', icon: 'link' },
  { key: 'video', label: 'Vídeo / Aula', icon: 'movie' },
  { key: 'article', label: 'Artigo / Documento', icon: 'menu_book' },
  { key: 'other', label: 'Outro Recurso', icon: 'folder' },
];

export default function FacultyFilesAndLinksPage() {
  const {
    isMounted,
    subjects,
    assignments,
    links,
    files,
    addLink,
    updateLink,
    deleteLink,
    addFile,
    updateFile,
    deleteFile,
  } = useAcademic();

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [resourceType, setResourceType] = useState<AcademicResourceType>('repo');

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');
  const [deliveryName, setDeliveryName] = useState<string>('');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'files' | 'links'>('all');
  const [filterSubjectId, setFilterSubjectId] = useState<string>('');

  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'link' | 'file'; title: string } | null>(null);
  const [itemToEdit, setItemToEdit] = useState<{ id: string; type: 'link' | 'file'; title: string; url?: string; description?: string; resourceType?: AcademicResourceType; subjectId?: string; assignmentId?: string; deliveryName?: string } | null>(null);

  // Filter assignments based on selected subject in the form
  const availableAssignments = useMemo(() => {
    return assignments.filter((a) => !selectedSubjectId || a.subjectId === selectedSubjectId);
  }, [assignments, selectedSubjectId]);

  const handleSubjectChange = (subjId: string) => {
    setSelectedSubjectId(subjId);
    if (selectedAssignmentId) {
      const match = assignments.find((a) => a.id === selectedAssignmentId);
      if (match && match.subjectId !== subjId) {
        setSelectedAssignmentId('');
      }
    }
  };

  const handleAddLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('data:') && !/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    addLink({
      title: title.trim(),
      url: formattedUrl,
      description: description.trim() || undefined,
      resourceType,
      subjectId: selectedSubjectId || undefined,
      assignmentId: selectedAssignmentId || undefined,
      deliveryName: deliveryName.trim() || undefined,
    });

    setTitle('');
    setUrl('');
    setDescription('');
    setDeliveryName('');
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    setIsUploading(true);
    for (const file of Array.from(uploadedFiles)) {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadFileToCloudAction(formData);

      if (res.success && res.url) {
        addFile({
          name: res.name || file.name,
          size: res.size || file.size,
          type: res.type || file.type,
          resourceType,
          subjectId: selectedSubjectId || undefined,
          assignmentId: selectedAssignmentId || undefined,
          deliveryName: deliveryName.trim() || undefined,
          dataUrl: res.url,
          storageUrl: res.url,
          storagePath: res.storagePath,
          storageProvider: res.storageProvider,
        });
      } else if (res.error) {
        alert(`⚠️ Erro ao enviar arquivo: ${res.error}`);
      }
    }
    setIsUploading(false);
  };

  const combinedResources = useMemo(() => {
    const linkItems = links.map((l) => ({ ...l, kind: 'link' as const }));
    const fileItems = files.map((f) => ({ ...f, title: f.name, kind: 'file' as const }));
    const all = [...linkItems, ...fileItems];

    return all.filter((item) => {
      if (filterMode === 'files' && item.kind !== 'file') return false;
      if (filterMode === 'links' && item.kind !== 'link') return false;
      if (filterSubjectId && item.subjectId !== filterSubjectId) return false;

      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSubject = subjects.find((s) => s.id === item.subjectId)?.name.toLowerCase().includes(q);
      const matchAssignment = assignments.find((a) => a.id === item.assignmentId)?.title.toLowerCase().includes(q);
      return matchTitle || !!matchSubject || !!matchAssignment;
    });
  }, [links, files, filterMode, filterSubjectId, searchQuery, subjects, assignments]);

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === 'link') {
      deleteLink(itemToDelete.id);
    } else {
      deleteFile(itemToDelete.id);
    }
    setItemToDelete(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemToEdit) return;

    if (itemToEdit.type === 'link') {
      updateLink(itemToEdit.id, {
        title: itemToEdit.title,
        url: itemToEdit.url,
        description: itemToEdit.description,
        resourceType: itemToEdit.resourceType,
        subjectId: itemToEdit.subjectId || undefined,
        assignmentId: itemToEdit.assignmentId || undefined,
        deliveryName: itemToEdit.deliveryName || undefined,
      });
    } else {
      updateFile(itemToEdit.id, {
        name: itemToEdit.title,
        resourceType: itemToEdit.resourceType,
        subjectId: itemToEdit.subjectId || undefined,
        assignmentId: itemToEdit.assignmentId || undefined,
        deliveryName: itemToEdit.deliveryName || undefined,
      });
    }

    setItemToEdit(null);
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

  return (
    <MainLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header Banner matching user reference image */}
        <div className="p-6 sm:p-8 rounded-3xl theme-surface border backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/estudos/faculdade"
              className="p-2 rounded-2xl theme-surface border text-secondary-theme hover:text-primary-theme transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-primary-theme flex items-center gap-2">
                <MaterialIcon name="folder" size={24} />
                <span>Arquivos &amp; Links — Faculdade</span>
              </h1>
              <p className="text-xs text-secondary-theme font-medium mt-0.5">
                Upload de arquivos, documentos, links externos e repositórios das disciplinas
              </p>
            </div>
          </div>

          <label className="py-2.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Fazer Upload de Arquivo</span>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.png,.jpg,.jpeg"
            />
          </label>
        </div>

        {/* Add Resource Card Form matching reference image */}
        <form onSubmit={handleAddLinkSubmit} className="p-6 rounded-3xl theme-surface border space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-primary-theme flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-indigo-400" />
            <span>Adicionar Novo Recurso / Link</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-4">
              <input
                type="text"
                required
                placeholder="Ex: Repositório GitHub, Material Drive, Slide de Aula..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-2xl theme-surface border text-xs text-primary-theme focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-5">
              <input
                type="url"
                required
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-2xl theme-surface border text-xs text-primary-theme focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="md:col-span-3">
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value as AcademicResourceType)}
                className="w-full py-2.5 px-3.5 rounded-2xl theme-surface border text-xs text-primary-theme focus:outline-none"
              >
                {RESOURCE_TYPES.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.icon} {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bindings Grid: Disciplina -> Trabalho -> Entrega */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-800">
            <div>
              <label className="block text-[10px] font-bold text-secondary-theme uppercase mb-1">
                Disciplina (Opcional)
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="w-full py-2 px-3 rounded-2xl theme-surface border text-xs text-primary-theme focus:outline-none"
              >
                <option value="">(Nenhuma disciplina)</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-secondary-theme uppercase mb-1">
                Trabalho / Avaliação (Opcional)
              </label>
              <select
                value={selectedAssignmentId}
                onChange={(e) => setSelectedAssignmentId(e.target.value)}
                className="w-full py-2 px-3 rounded-2xl theme-surface border text-xs text-primary-theme focus:outline-none"
              >
                <option value="">(Nenhum trabalho)</option>
                {availableAssignments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-secondary-theme uppercase mb-1">
                Entrega / Etapa (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: Entrega 1, Trabalho Final"
                value={deliveryName}
                onChange={(e) => setDeliveryName(e.target.value)}
                className="w-full py-2 px-3 rounded-2xl theme-surface border text-xs text-primary-theme focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="py-2.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Salvar Recurso</span>
            </button>
          </div>
        </form>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-3xl theme-surface border backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterMode('all')}
              className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all ${
                filterMode === 'all'
                  ? 'theme-card-elevated text-primary-theme border shadow-sm'
                  : 'text-secondary-theme hover:text-primary-theme'
              }`}
            >
              Todos ({combinedResources.length})
            </button>
            <button
              onClick={() => setFilterMode('files')}
              className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all ${
                filterMode === 'files'
                  ? 'theme-card-elevated text-cyan-400 border shadow-sm'
                  : 'text-secondary-theme hover:text-primary-theme'
              }`}
            >
              Arquivos ({files.length})
            </button>
            <button
              onClick={() => setFilterMode('links')}
              className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all ${
                filterMode === 'links'
                  ? 'theme-card-elevated text-indigo-400 border shadow-sm'
                  : 'text-secondary-theme hover:text-primary-theme'
              }`}
            >
              Links ({links.length})
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={filterSubjectId}
              onChange={(e) => setFilterSubjectId(e.target.value)}
              className="py-1.5 px-3 rounded-xl theme-surface border text-xs text-primary-theme"
            >
              <option value="">Todas as disciplinas</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-tertiary-theme absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Pesquisar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-1.5 pl-8 pr-3 rounded-xl theme-surface border text-xs text-primary-theme focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Resources Grid List */}
        {combinedResources.length === 0 ? (
          <div className="p-12 text-center text-xs text-secondary-theme theme-surface rounded-3xl border">
            Nenhum link ou arquivo cadastrado.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {combinedResources.map((res) => {
              const subj = subjects.find((s) => s.id === res.subjectId);
              const assig = assignments.find((a) => a.id === res.assignmentId);
              const rType = RESOURCE_TYPES.find((t) => t.key === res.resourceType) || RESOURCE_TYPES[10];

              return (
                <div
                  key={res.id}
                  className="p-5 rounded-3xl theme-surface border hover:border-zinc-700 transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{rType.icon}</span>
                        <h4 className="text-sm font-bold text-primary-theme group-hover:text-indigo-400 transition-colors truncate">
                          {res.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setItemToEdit({
                            id: res.id,
                            type: res.kind,
                            title: res.title,
                            url: 'url' in res ? res.url : undefined,
                            description: 'description' in res ? res.description : undefined,
                            resourceType: res.resourceType,
                            subjectId: res.subjectId,
                            assignmentId: res.assignmentId,
                            deliveryName: res.deliveryName,
                          })}
                          className="p-1 text-tertiary-theme hover:text-white"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setItemToDelete({ id: res.id, type: res.kind, title: res.title })}
                          className="p-1 text-tertiary-theme hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {'description' in res && res.description && (
                      <p className="text-xs text-secondary-theme leading-relaxed font-mono">
                        {res.description}
                      </p>
                    )}

                    {/* Bindings Trail */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-semibold text-secondary-theme">
                      {subj && (
                        <span className="px-2 py-0.5 rounded-lg theme-card-elevated border text-indigo-400">
                          {subj.name}
                        </span>
                      )}
                      {assig && (
                        <span className="px-2 py-0.5 rounded-lg theme-card-elevated border text-cyan-400">
                          → {assig.title}
                        </span>
                      )}
                      {res.deliveryName && (
                        <span className="px-2 py-0.5 rounded-lg theme-card-elevated border text-purple-400">
                          → {res.deliveryName}
                        </span>
                      )}
                      {res.kind === 'file' && (
                        <span
                          className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${
                            (res as any).storageProvider === 'supabase' || (res as any).storageProvider === 's3'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                          }`}
                        >
                          {(res as any).storageProvider === 'supabase' || (res as any).storageProvider === 's3'
                            ? '☁️ Nuvem'
                            : '💾 Local'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                    <span className="text-[10px] text-tertiary-theme font-mono">
                      {res.kind === 'file' ? ((res as any).size ? `${((res as any).size / 1024).toFixed(1)} KB` : 'Arquivo') : 'Link Externo'}
                    </span>

                    {res.kind === 'file' && (res as any).dataUrl ? (
                      <a
                        href={(res as any).dataUrl}
                        download={res.title}
                        className="py-1 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Baixar</span>
                      </a>
                    ) : 'url' in res ? (
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Abrir Link</span>
                      </a>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {itemToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-sm p-6 rounded-3xl theme-surface border backdrop-blur-xl space-y-4 text-center">
              <AlertTriangle className="w-10 h-10 text-red-400 mx-auto animate-bounce" />
              <div>
                <h3 className="text-base font-bold text-primary-theme">Confirmar Exclusão</h3>
                <p className="text-xs text-secondary-theme mt-1">
                  Tem certeza que deseja excluir o recurso <strong>&quot;{itemToDelete.title}&quot;</strong>?
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setItemToDelete(null)}
                  className="py-2 px-4 rounded-2xl theme-surface border text-xs font-bold text-secondary-theme"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="py-2 px-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md"
                >
                  Excluir Recurso
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {itemToEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <form onSubmit={handleSaveEdit} className="w-full max-w-md p-6 rounded-3xl theme-surface border backdrop-blur-xl space-y-4">
              <h3 className="text-base font-bold text-primary-theme">Editar Recurso</h3>

              <div>
                <label className="text-[10px] font-bold text-secondary-theme uppercase block mb-1">Título</label>
                <input
                  type="text"
                  required
                  value={itemToEdit.title}
                  onChange={(e) => setItemToEdit({ ...itemToEdit, title: e.target.value })}
                  className="w-full py-2 px-3 rounded-2xl theme-surface border text-xs text-primary-theme"
                />
              </div>

              {itemToEdit.type === 'link' && (
                <div>
                  <label className="text-[10px] font-bold text-secondary-theme uppercase block mb-1">URL</label>
                  <input
                    type="url"
                    required
                    value={itemToEdit.url || ''}
                    onChange={(e) => setItemToEdit({ ...itemToEdit, url: e.target.value })}
                    className="w-full py-2 px-3 rounded-2xl theme-surface border text-xs text-primary-theme"
                  />
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-secondary-theme uppercase block mb-1">Tipo de Recurso</label>
                <select
                  value={itemToEdit.resourceType || 'other'}
                  onChange={(e) => setItemToEdit({ ...itemToEdit, resourceType: e.target.value as AcademicResourceType })}
                  className="w-full py-2 px-3 rounded-2xl theme-surface border text-xs text-primary-theme"
                >
                  {RESOURCE_TYPES.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.icon} {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setItemToEdit(null)}
                  className="py-2 px-4 rounded-2xl theme-surface border text-xs font-bold text-secondary-theme"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
