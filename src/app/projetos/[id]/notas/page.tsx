'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { useProjects } from '@/hooks/useProjects';
import { ProjectNoteModal } from '@/components/projects/ProjectNoteModal';
import { ProjectNote } from '@/types/projects';
import { FileText, Plus, Pin, Archive, Pencil, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<ProjectNote | null>(null);

  const project = projects.find((p) => p.id === projectId);
  const projCols = columns.filter((c) => c.projectId === projectId);
  const projNotes = notes.filter((n) => n.projectId === projectId);

  const handleOpenAdd = () => {
    setNoteToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (n: ProjectNote) => {
    setNoteToEdit(n);
    setIsModalOpen(true);
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
              <h2 className="text-xl font-extrabold text-white">Notas Rápidas — {project.name}</h2>
              <p className="text-xs text-zinc-400 font-medium">Caderno de ideias e notas convertíveis em tarefas</p>
            </div>
          </div>

          <button
            onClick={handleOpenAdd}
            className="py-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nota Rápida</span>
          </button>
        </div>

        {/* Notes Grid */}
        {projNotes.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500 bg-zinc-900/40 rounded-3xl border border-zinc-800">
            Nenhuma nota criada neste projeto.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projNotes.map((note) => (
              <div
                key={note.id}
                className={`p-6 rounded-3xl border backdrop-blur-xl space-y-3 flex flex-col justify-between transition-all group ${
                  note.isPinned
                    ? 'bg-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-500/10'
                    : 'bg-zinc-900/80 border-zinc-800/80'
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
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleArchiveNote(note.id)}
                        className={`p-1.5 rounded-xl transition-colors ${
                          note.isArchived ? 'text-purple-400 bg-purple-500/10' : 'text-zinc-500 hover:text-white'
                        }`}
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 font-mono leading-relaxed whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80 text-xs">
                  <button
                    onClick={() => convertNoteToTask(note.id, projCols[0]?.id || '')}
                    className="py-1 px-2.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 font-bold text-[10px] flex items-center gap-1 transition-all"
                  >
                    <span>Transformar em Tarefa</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

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
            ))}
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
