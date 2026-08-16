'use client';

import React, { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useStudies } from '@/hooks/useStudies';
import { NoteModal } from '@/components/studies/NoteModal';
import { StudyNote } from '@/types/studies';
import {
  FileText,
  Plus,
  Search,
  Pin,
  Archive,
  Pencil,
  Trash2,
  Tag as TagIcon,
  BookOpen,
} from 'lucide-react';

export default function AnotacoesPage() {
  const {
    isMounted,
    subjects,
    topics,
    notes,
    addNote,
    updateNote,
    togglePinNote,
    toggleArchiveNote,
    deleteNote,
  } = useStudies();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pinned' | 'archived'>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');

  // Keep-style quick creation bar state
  const [isQuickCreating, setIsQuickCreating] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickContent, setQuickContent] = useState('');
  const [quickSubjectId, setQuickSubjectId] = useState('');
  const [quickTags, setQuickTags] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<StudyNote | null>(null);

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      // Filter Type
      if (filterType === 'pinned' && (!n.isPinned || n.isArchived)) return false;
      if (filterType === 'archived' && !n.isArchived) return false;
      if (filterType !== 'archived' && n.isArchived) return false;

      // Subject Filter
      if (selectedSubjectId !== 'all' && n.subjectId !== selectedSubjectId) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = n.title.toLowerCase().includes(q);
        const contentMatch = n.content.toLowerCase().includes(q);
        const tagMatch = n.tags && n.tags.some((t) => t.toLowerCase().includes(q));

        if (!titleMatch && !contentMatch && !tagMatch) return false;
      }

      return true;
    });
  }, [notes, filterType, selectedSubjectId, searchQuery]);

  const pinnedNotes = useMemo(() => filteredNotes.filter((n) => n.isPinned), [filteredNotes]);
  const otherNotes = useMemo(() => filteredNotes.filter((n) => !n.isPinned), [filteredNotes]);

  const handleQuickCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() && !quickContent.trim()) return;

    const tagsArr = quickTags
      .split(',')
      .map((t) => t.trim().toLowerCase().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    addNote({
      title: quickTitle.trim() || 'Nota Sem Título',
      content: quickContent.trim(),
      subjectId: quickSubjectId || undefined,
      tags: tagsArr,
      isPinned: false,
      isArchived: false,
    });

    setQuickTitle('');
    setQuickContent('');
    setQuickSubjectId('');
    setQuickTags('');
    setIsQuickCreating(false);
  };

  const handleOpenAdd = () => {
    setNoteToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (n: StudyNote) => {
    setNoteToEdit(n);
    setIsModalOpen(true);
  };

  const handleSaveModal = (data: Omit<StudyNote, 'id' | 'createdAt' | 'updatedAt'>) => {
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
          <div className="w-8 h-8 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-3xl theme-surface border backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-primary-theme">Anotações de Estudo</h2>
              <p className="text-xs text-secondary-theme font-medium">Caderno pessoal de anotações, resumos e dicas</p>
            </div>
          </div>

          <button
            onClick={handleOpenAdd}
            className="py-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Anotação</span>
          </button>
        </div>

        {/* Google Keep-style Quick Creation Bar */}
        <div className="max-w-2xl mx-auto">
          {!isQuickCreating ? (
            <div
              onClick={() => setIsQuickCreating(true)}
              className="p-4 rounded-2xl theme-surface border hover:border-zinc-700 shadow-md cursor-pointer transition-all flex items-center justify-between group"
            >
              <span className="text-xs text-secondary-theme font-medium group-hover:text-primary-theme">
                Criar uma nota de estudo...
              </span>
              <Plus className="w-4 h-4 text-tertiary-theme group-hover:text-indigo-400 transition-colors" />
            </div>
          ) : (
            <form
              onSubmit={handleQuickCreateSubmit}
              className="p-5 rounded-3xl theme-surface border shadow-2xl space-y-3 animate-fade-in"
            >
              <input
                type="text"
                placeholder="Título da nota"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                className="w-full bg-transparent text-sm font-bold text-primary-theme focus:outline-none placeholder-secondary-theme"
                autoFocus
              />

              <textarea
                placeholder="Criar uma nota de estudo..."
                rows={4}
                value={quickContent}
                onChange={(e) => setQuickContent(e.target.value)}
                className="w-full bg-transparent text-xs text-primary-theme focus:outline-none placeholder-secondary-theme resize-none font-mono leading-relaxed"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-zinc-800">
                <select
                  value={quickSubjectId}
                  onChange={(e) => setQuickSubjectId(e.target.value)}
                  className="w-full py-1.5 px-3 rounded-xl theme-surface border text-xs text-primary-theme"
                >
                  <option value="">(Nenhuma matéria)</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Tags: javascript, react, resumo..."
                  value={quickTags}
                  onChange={(e) => setQuickTags(e.target.value)}
                  className="w-full py-1.5 px-3 rounded-xl theme-surface border text-xs text-primary-theme"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuickCreating(false)}
                  className="py-1.5 px-4 rounded-xl text-xs font-bold text-secondary-theme hover:text-primary-theme transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-1.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all"
                >
                  Criar Nota
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 rounded-3xl theme-surface border backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative w-full sm:w-80 flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-tertiary-theme" />
            <input
              type="text"
              placeholder="Pesquisar por título, texto ou #tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2.5 pl-10 pr-3.5 rounded-2xl theme-surface border text-primary-theme placeholder-secondary-theme text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-1 p-1 rounded-2xl theme-surface border text-xs font-semibold">
              <button
                onClick={() => setFilterType('all')}
                className={`py-1 px-3 rounded-xl transition-all ${
                  filterType === 'all' ? 'theme-card-elevated text-indigo-400 font-bold border' : 'text-secondary-theme hover:text-primary-theme'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilterType('pinned')}
                className={`py-1 px-3 rounded-xl transition-all ${
                  filterType === 'pinned' ? 'theme-card-elevated text-amber-400 font-bold border' : 'text-secondary-theme hover:text-primary-theme'
                }`}
              >
                Fixadas
              </button>
              <button
                onClick={() => setFilterType('archived')}
                className={`py-1 px-3 rounded-xl transition-all ${
                  filterType === 'archived' ? 'theme-card-elevated text-purple-400 font-bold border' : 'text-secondary-theme hover:text-primary-theme'
                }`}
              >
                Arquivadas
              </button>
            </div>

            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="py-2 px-3 rounded-2xl theme-surface border text-primary-theme text-xs focus:outline-none font-semibold"
            >
              <option value="all">Todas as Matérias</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Keep-style Notes Container */}
        {filteredNotes.length === 0 ? (
          <div className="p-12 text-center text-xs text-secondary-theme theme-surface rounded-3xl border">
            Nenhuma anotação encontrada.
          </div>
        ) : (
          <div className="space-y-8">
            {/* Pinned Notes Section */}
            {pinnedNotes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Pin className="w-3.5 h-3.5" />
                  <span>Fixadas</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pinnedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      subjects={subjects}
                      onTogglePin={togglePinNote}
                      onToggleArchive={toggleArchiveNote}
                      onEdit={handleOpenEdit}
                      onDelete={deleteNote}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Other Notes Section */}
            {otherNotes.length > 0 && (
              <div className="space-y-3">
                {pinnedNotes.length > 0 && (
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-secondary-theme">
                    Outras Notas
                  </h3>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {otherNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      subjects={subjects}
                      onTogglePin={togglePinNote}
                      onToggleArchive={toggleArchiveNote}
                      onEdit={handleOpenEdit}
                      onDelete={deleteNote}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <NoteModal
          isOpen={isModalOpen}
          noteToEdit={noteToEdit}
          subjects={subjects}
          topics={topics}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveModal}
          onDelete={deleteNote}
        />
      </div>
    </MainLayout>
  );
}

interface NoteCardProps {
  note: StudyNote;
  subjects: { id: string; name: string; color: string }[];
  onTogglePin: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onEdit: (note: StudyNote) => void;
  onDelete: (id: string) => void;
}

function NoteCard({ note, subjects, onTogglePin, onToggleArchive, onEdit, onDelete }: NoteCardProps) {
  const sub = subjects.find((s) => s.id === note.subjectId);

  return (
    <div
      className={`p-5 rounded-3xl border backdrop-blur-xl space-y-3 flex flex-col justify-between transition-all group hover:shadow-xl ${
        note.isPinned
          ? 'theme-surface border-amber-500/40 shadow-lg shadow-amber-500/10'
          : 'theme-surface border-zinc-800 hover:border-zinc-700'
      }`}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-bold text-primary-theme group-hover:text-indigo-400 transition-colors leading-snug">
            {note.title}
          </h4>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onTogglePin(note.id)}
              className={`p-1.5 rounded-xl transition-colors ${
                note.isPinned ? 'text-amber-400 bg-amber-500/10' : 'text-tertiary-theme hover:text-primary-theme'
              }`}
              title={note.isPinned ? 'Desafixar' : 'Fixar no topo'}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onToggleArchive(note.id)}
              className={`p-1.5 rounded-xl transition-colors ${
                note.isArchived ? 'text-purple-400 bg-purple-500/10' : 'text-tertiary-theme hover:text-primary-theme'
              }`}
              title={note.isArchived ? 'Desarquivar' : 'Arquivar'}
            >
              <Archive className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <p className="text-xs text-secondary-theme font-mono leading-relaxed whitespace-pre-wrap">
          {note.content}
        </p>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            {note.tags.map((t, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md theme-card-elevated border text-[10px] font-mono text-indigo-400"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs">
        {sub ? (
          <span
            className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-sm"
            style={{ backgroundColor: sub.color }}
          >
            {sub.name}
          </span>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(note)}
            className="p-1.5 rounded-xl text-tertiary-theme hover:text-primary-theme hover:bg-zinc-800 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-1.5 rounded-xl text-tertiary-theme hover:text-red-400 hover:bg-zinc-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
