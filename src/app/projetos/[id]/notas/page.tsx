'use client';

import React, { useState, use, useMemo } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { useProjects } from '@/hooks/useProjects';
import { ProjectNoteModal } from '@/components/projects/ProjectNoteModal';
import { ProjectNote } from '@/types/projects';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import {
  FileText,
  Plus,
  Pin,
  Archive,
  Pencil,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Search,
  Tag as TagIcon,
  CheckSquare,
} from 'lucide-react';

export default function ProjectNotesPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const {
    isMounted,
    projects,
    columns,
    notes,
    addNote,
    updateNote,
    togglePinNote,
    toggleArchiveNote,
    deleteNote,
    convertNoteToTask,
  } = useProjects();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'pinned' | 'archived'>('all');

  const [isQuickCreating, setIsQuickCreating] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickContent, setQuickContent] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<ProjectNote | null>(null);

  const project = projects.find((p) => p.id === projectId);
  const projCols = columns.filter((c) => c.projectId === projectId);
  const projNotes = notes.filter((n) => n.projectId === projectId);

  const filteredNotes = useMemo(() => {
    return projNotes.filter((note) => {
      const matchesSearch =
        !searchQuery ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());

      if (filterTab === 'pinned') return matchesSearch && note.isPinned && !note.isArchived;
      if (filterTab === 'archived') return matchesSearch && note.isArchived;
      return matchesSearch && !note.isArchived;
    });
  }, [projNotes, searchQuery, filterTab]);

  const pinnedNotes = useMemo(() => filteredNotes.filter((n) => n.isPinned), [filteredNotes]);
  const otherNotes = useMemo(() => filteredNotes.filter((n) => !n.isPinned), [filteredNotes]);

  const handleQuickCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() && !quickContent.trim()) return;

    addNote({
      projectId,
      title: quickTitle.trim() || 'Nota Sem Título',
      content: quickContent.trim(),
      tags: [],
      isPinned: false,
      isArchived: false,
    });

    setQuickTitle('');
    setQuickContent('');
    setIsQuickCreating(false);
  };

  const handleSaveModal = (data: Omit<ProjectNote, 'id' | 'createdAt'>) => {
    if (noteToEdit) {
      updateNote(noteToEdit.id, data);
    } else {
      addNote(data);
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

  if (!project) {
    return (
      <MainLayout>
        <div className="p-8 text-center text-zinc-400">Projeto não encontrado.</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-3xl theme-surface border backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Link
              href={`/projetos/${project.id}`}
              className="p-2 rounded-2xl theme-surface border text-secondary-theme hover:text-primary-theme transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h2 className="text-xl font-extrabold text-primary-theme">Notas Rápidas — {project.name}</h2>
              <p className="text-xs text-secondary-theme font-medium">Caderno de ideias no estilo Google Keep</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-tertiary-theme absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Pesquisar notas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 pl-9 pr-3 rounded-2xl theme-surface border text-xs text-primary-theme focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Quick Create Bar (Google Keep style) */}
        <div className="max-w-xl mx-auto">
          {!isQuickCreating ? (
            <div
              onClick={() => setIsQuickCreating(true)}
              className="p-3.5 rounded-2xl theme-surface border flex items-center justify-between text-xs text-secondary-theme cursor-pointer hover:border-zinc-700 transition-all shadow-md"
            >
              <span className="font-medium">Criar uma nota...</span>
              <div className="flex items-center gap-2 text-tertiary-theme">
                <CheckSquare className="w-4 h-4" />
                <Pencil className="w-4 h-4" />
              </div>
            </div>
          ) : (
            <form onSubmit={handleQuickCreateSubmit} className="p-4 rounded-2xl theme-surface border space-y-3 shadow-xl animate-fade-in">
              <input
                type="text"
                placeholder="Título"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                className="w-full bg-transparent font-bold text-sm text-primary-theme focus:outline-none placeholder:text-tertiary-theme"
                autoFocus
              />
              <textarea
                rows={3}
                placeholder="Escreva sua nota..."
                value={quickContent}
                onChange={(e) => setQuickContent(e.target.value)}
                className="w-full bg-transparent text-xs text-primary-theme focus:outline-none resize-none placeholder:text-tertiary-theme font-mono"
              />
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsQuickCreating(false)}
                  className="py-1 px-3 rounded-xl text-xs font-bold text-secondary-theme"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  className="py-1 px-4 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md"
                >
                  Salvar
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Category / Status Tabs */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <button
            onClick={() => setFilterTab('all')}
            className={`py-1.5 px-4 rounded-xl transition-all ${
              filterTab === 'all'
                ? 'theme-card-elevated text-primary-theme font-bold border shadow-sm'
                : 'text-secondary-theme hover:text-primary-theme'
            }`}
          >
            Todas ({projNotes.filter((n) => !n.isArchived).length})
          </button>
          <button
            onClick={() => setFilterTab('pinned')}
            className={`py-1.5 px-4 rounded-xl transition-all ${
              filterTab === 'pinned'
                ? 'theme-card-elevated text-amber-400 font-bold border shadow-sm'
                : 'text-secondary-theme hover:text-primary-theme'
            }`}
          >
            <span className="inline-flex items-center gap-1.5"><MaterialIcon name="push_pin" size={14} /> Fixadas ({projNotes.filter((n) => n.isPinned && !n.isArchived).length})</span>
          </button>
          <button
            onClick={() => setFilterTab('archived')}
            className={`py-1.5 px-4 rounded-xl transition-all ${
              filterTab === 'archived'
                ? 'theme-card-elevated text-purple-400 font-bold border shadow-sm'
                : 'text-secondary-theme hover:text-primary-theme'
            }`}
          >
            <span className="inline-flex items-center gap-1.5"><MaterialIcon name="inbox" size={14} /> Arquivadas ({projNotes.filter((n) => n.isArchived).length})</span>
          </button>
        </div>

        {/* Notes Cards Display */}
        {filteredNotes.length === 0 ? (
          <div className="p-12 text-center text-xs text-secondary-theme theme-surface rounded-3xl border">
            Nenhuma nota encontrada.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pinned Section */}
            {pinnedNotes.length > 0 && filterTab === 'all' && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Pin className="w-3.5 h-3.5" />
                  <span>Fixadas</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {pinnedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      projCols={projCols}
                      onEdit={() => {
                        setNoteToEdit(note);
                        setIsModalOpen(true);
                      }}
                      onTogglePin={() => togglePinNote(note.id)}
                      onToggleArchive={() => toggleArchiveNote(note.id)}
                      onDelete={() => deleteNote(note.id)}
                      onConvertToTask={() => convertNoteToTask(note.id, projCols[0]?.id || '')}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Other Notes Section */}
            {(otherNotes.length > 0 || filterTab !== 'all') && (
              <div className="space-y-3">
                {pinnedNotes.length > 0 && filterTab === 'all' && (
                  <h3 className="text-xs font-bold text-secondary-theme uppercase tracking-wider">Outras</h3>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {(filterTab === 'all' ? otherNotes : filteredNotes).map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      projCols={projCols}
                      onEdit={() => {
                        setNoteToEdit(note);
                        setIsModalOpen(true);
                      }}
                      onTogglePin={() => togglePinNote(note.id)}
                      onToggleArchive={() => toggleArchiveNote(note.id)}
                      onDelete={() => deleteNote(note.id)}
                      onConvertToTask={() => convertNoteToTask(note.id, projCols[0]?.id || '')}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <ProjectNoteModal
          isOpen={isModalOpen}
          noteToEdit={noteToEdit}
          projectId={project.id}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveModal}
          onDelete={deleteNote}
        />
      </div>
    </MainLayout>
  );
}

function NoteCard({
  note,
  projCols,
  onEdit,
  onTogglePin,
  onToggleArchive,
  onDelete,
  onConvertToTask,
}: {
  note: ProjectNote;
  projCols: any[];
  onEdit: () => void;
  onTogglePin: () => void;
  onToggleArchive: () => void;
  onDelete: () => void;
  onConvertToTask: () => void;
}) {
  return (
    <div
      className={`p-4 sm:p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-3 group ${
        note.isPinned
          ? 'theme-card-elevated border-amber-500/50 shadow-md'
          : 'theme-surface hover:border-zinc-700'
      }`}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-bold text-primary-theme group-hover:text-indigo-400 transition-colors">
            {note.title}
          </h4>

          <button
            onClick={onTogglePin}
            className={`p-1 rounded-xl transition-colors ${
              note.isPinned ? 'text-amber-400' : 'text-tertiary-theme opacity-0 group-hover:opacity-100 hover:text-white'
            }`}
          >
            <Pin className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>

        <p className="text-xs text-secondary-theme leading-relaxed whitespace-pre-wrap font-mono">
          {note.content}
        </p>
      </div>

      <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
        <button
          onClick={onConvertToTask}
          className="py-1 px-2 rounded-xl theme-card-elevated border text-[10px] font-bold text-cyan-400 flex items-center gap-1 hover:bg-zinc-800 transition-all"
        >
          <span>Virar Tarefa</span>
          <ArrowRight className="w-3 h-3" />
        </button>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onToggleArchive} className="p-1 text-tertiary-theme hover:text-purple-400">
            <Archive className="w-3.5 h-3.5" />
          </button>
          <button onClick={onEdit} className="p-1 text-tertiary-theme hover:text-white">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} className="p-1 text-tertiary-theme hover:text-red-400">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
