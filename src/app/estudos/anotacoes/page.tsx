'use client';

import React, { useState } from 'react';
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
  Tag,
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<StudyNote | null>(null);

  const filteredNotes = notes.filter((n) => {
    // Filter Type
    if (filterType === 'pinned' && !n.isPinned) return false;
    if (filterType === 'archived' && !n.isArchived) return false;
    if (filterType !== 'archived' && n.isArchived) return false; // Hide archived by default

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Anotações de Estudo</h2>
              <p className="text-xs text-zinc-400 font-medium">Caderno pessoal de anotações e resumos</p>
            </div>
          </div>

          <button
            onClick={handleOpenAdd}
            className="py-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Anotação</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative w-full sm:w-80 flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Pesquisar por título, texto ou #tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2.5 pl-10 pr-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs font-semibold">
              <button
                onClick={() => setFilterType('all')}
                className={`py-1 px-3 rounded-xl transition-all ${
                  filterType === 'all' ? 'bg-zinc-800 text-indigo-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilterType('pinned')}
                className={`py-1 px-3 rounded-xl transition-all ${
                  filterType === 'pinned' ? 'bg-zinc-800 text-amber-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Fixadas
              </button>
              <button
                onClick={() => setFilterType('archived')}
                className={`py-1 px-3 rounded-xl transition-all ${
                  filterType === 'archived' ? 'bg-zinc-800 text-purple-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Arquivadas
              </button>
            </div>

            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="py-2 px-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
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

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500 bg-zinc-900/40 rounded-3xl border border-zinc-800">
            Nenhuma anotação encontrada.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => {
              const sub = subjects.find((s) => s.id === note.subjectId);
              return (
                <div
                  key={note.id}
                  className={`p-6 rounded-3xl border backdrop-blur-xl space-y-3 flex flex-col justify-between transition-all group ${
                    note.isPinned
                      ? 'bg-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-500/10'
                      : 'bg-zinc-900/80 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {note.isPinned && '📌 '}
                        {note.title}
                      </h3>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => togglePinNote(note.id)}
                          className={`p-1.5 rounded-xl transition-colors ${
                            note.isPinned ? 'text-amber-400 bg-amber-500/10' : 'text-zinc-500 hover:text-white'
                          }`}
                          title={note.isPinned ? 'Desafixar' : 'Fixar no topo'}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => toggleArchiveNote(note.id)}
                          className={`p-1.5 rounded-xl transition-colors ${
                            note.isArchived ? 'text-purple-400 bg-purple-500/10' : 'text-zinc-500 hover:text-white'
                          }`}
                          title={note.isArchived ? 'Desarquivar' : 'Arquivar'}
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-300 font-mono leading-relaxed whitespace-pre-wrap">
                      {note.content}
                    </p>

                    {/* Tags */}
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-2">
                        {note.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-indigo-400"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80 text-xs">
                    {sub ? (
                      <span
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white"
                        style={{ backgroundColor: sub.color }}
                      >
                        {sub.name}
                      </span>
                    ) : (
                      <span />
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(note)}
                        className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-1.5 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-zinc-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
