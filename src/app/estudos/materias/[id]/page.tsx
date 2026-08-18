'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { useStudies } from '@/hooks/useStudies';
import { TopicModal } from '@/components/studies/TopicModal';
import { NoteModal } from '@/components/studies/NoteModal';
import { ResourceModal } from '@/components/studies/ResourceModal';
import { Topic, StudyNote, TopicStatus } from '@/types/studies';
import {
  BookOpen,
  Plus,
  Clock,
  CheckCircle2,
  ArrowLeft,
  ExternalLink,
  Tag,
  Pencil,
  Trash2,
  FileText,
} from 'lucide-react';

export default function SingleSubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const subjectId = resolvedParams.id;

  const {
    isMounted,
    subjects,
    topics,
    notes,
    resources,
    getSubjectProgress,
    addTopic,
    updateTopic,
    setTopicStatus,
    deleteTopic,
    addNote,
    updateNote,
    deleteNote,
    addResource,
    deleteResource,
  } = useStudies();

  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [topicToEdit, setTopicToEdit] = useState<Topic | null>(null);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<StudyNote | null>(null);

  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);

  const subject = subjects.find((s) => s.id === subjectId);
  const subjectTopics = topics.filter((t) => t.subjectId === subjectId);
  const subjectNotes = notes.filter((n) => n.subjectId === subjectId);
  const subjectResources = resources.filter((r) => r.subjectId === subjectId);

  if (!isMounted) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="w-8 h-8 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (!subject) {
    return (
      <MainLayout>
        <div className="p-8 text-center space-y-4">
          <p className="text-zinc-400">Matéria não encontrada.</p>
          <Link
            href="/estudos/materias"
            className="py-2 px-4 rounded-2xl bg-indigo-600 text-white font-bold text-xs inline-block"
          >
            Voltar para Matérias
          </Link>
        </div>
      </MainLayout>
    );
  }

  const progressPct = getSubjectProgress(subject.id);
  const completedCount = subjectTopics.filter((t) => t.status === 'completed').length;
  const hoursStudied = (subject.totalTimeMinutes / 60).toFixed(1);

  const handleSaveTopic = (data: Omit<Topic, 'id' | 'totalTimeMinutes' | 'createdAt'>) => {
    if (topicToEdit) {
      updateTopic(topicToEdit.id, data);
    } else {
      addTopic(data);
    }
  };

  const handleSaveNote = (data: Omit<StudyNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (noteToEdit) {
      updateNote(noteToEdit.id, data);
    } else {
      addNote(data);
    }
  };

  const handleSaveResource = (data: Omit<import('@/types/studies').StudyResource, 'id' | 'createdAt'>) => {
    addResource(data);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Back Link */}
        <Link
          href="/estudos/materias"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para todas as matérias</span>
        </Link>

        {/* Subject Header Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                className="w-5 h-5 rounded-full shadow-lg"
                style={{ backgroundColor: subject.color }}
              />
              <div>
                <h1 className="text-2xl font-extrabold text-white">{subject.name}</h1>
                {subject.description && (
                  <p className="text-xs text-zinc-400 mt-0.5">{subject.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs font-bold text-zinc-300">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>{hoursStudied}h estudadas / Meta: {subject.monthlyHoursGoal}h</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-zinc-400">Progresso Geral da Matéria</span>
              <span className="font-mono text-emerald-400">
                {completedCount} / {subjectTopics.length} ({progressPct}%)
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-zinc-950 overflow-hidden p-0.5 border border-zinc-800">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%`, backgroundColor: subject.color }}
              />
            </div>
          </div>
        </div>

        {/* Main Grid: Topics on Left, Notes & Links on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Topics List (Left) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Conteúdos &amp; Tópicos ({subjectTopics.length})</h3>
                <button
                  onClick={() => {
                    setTopicToEdit(null);
                    setIsTopicModalOpen(true);
                  }}
                  className="py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo Conteúdo</span>
                </button>
              </div>

              {subjectTopics.length === 0 ? (
                <p className="text-xs text-zinc-500 py-6 text-center">Nenhum conteúdo cadastrado nesta matéria.</p>
              ) : (
                <div className="space-y-2">
                  {subjectTopics.map((top) => (
                    <div
                      key={top.id}
                      className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <select
                          value={top.status}
                          onChange={(e) => setTopicStatus(top.id, e.target.value as TopicStatus)}
                          className="py-1 px-2 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-bold text-zinc-300 focus:outline-none"
                        >
                          <option value="not_started">Não iniciado</option>
                          <option value="in_progress">Em andamento</option>
                          <option value="completed">Concluído</option>
                        </select>

                        <div>
                          <h4 className={`font-bold ${top.status === 'completed' ? 'line-through text-zinc-500' : 'text-white'}`}>
                            {top.title}
                          </h4>
                          {top.description && (
                            <p className="text-[11px] text-zinc-400 mt-0.5">{top.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setTopicToEdit(top);
                            setIsTopicModalOpen(true);
                          }}
                          className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteTopic(top.id)}
                          className="p-1.5 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-zinc-900"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notes & Resources (Right) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Notes Section */}
            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">Anotações ({subjectNotes.length})</h3>
                </div>
                <button
                  onClick={() => {
                    setNoteToEdit(null);
                    setIsNoteModalOpen(true);
                  }}
                  className="p-1.5 rounded-xl text-indigo-400 hover:text-white hover:bg-zinc-800"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {subjectNotes.length === 0 ? (
                <p className="text-xs text-zinc-500 py-4 text-center">Nenhuma anotação vinculada.</p>
              ) : (
                <div className="space-y-2">
                  {subjectNotes.map((note) => (
                    <div key={note.id} className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white truncate">{note.title}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setNoteToEdit(note); setIsNoteModalOpen(true); }} className="p-1 text-zinc-400 hover:text-white">
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button onClick={() => deleteNote(note.id)} className="p-1 text-zinc-400 hover:text-red-400">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-2">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resources / Links Section */}
            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Links &amp; Recursos ({subjectResources.length})</h3>
                </div>
                <button
                  onClick={() => setIsResourceModalOpen(true)}
                  className="p-1.5 rounded-xl text-emerald-400 hover:text-white hover:bg-zinc-800"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {subjectResources.length === 0 ? (
                <p className="text-xs text-zinc-500 py-4 text-center">Nenhum recurso de estudo adicionado.</p>
              ) : (
                <div className="space-y-2">
                  {subjectResources.map((res) => (
                    <div key={res.id} className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs">
                      <div>
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-indigo-400 hover:underline flex items-center gap-1.5"
                        >
                          <span>{res.name}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        {res.description && (
                          <p className="text-[10px] text-zinc-400 mt-0.5">{res.description}</p>
                        )}
                      </div>
                      <button onClick={() => deleteResource(res.id)} className="p-1 text-zinc-400 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
        <TopicModal
          isOpen={isTopicModalOpen}
          topicToEdit={topicToEdit}
          subjects={subjects}
          defaultSubjectId={subject.id}
          onClose={() => setIsTopicModalOpen(false)}
          onSave={handleSaveTopic}
          onDelete={deleteTopic}
        />

        <NoteModal
          isOpen={isNoteModalOpen}
          noteToEdit={noteToEdit}
          subjects={subjects}
          topics={topics}
          defaultSubjectId={subject.id}
          onClose={() => setIsNoteModalOpen(false)}
          onSave={handleSaveNote}
          onDelete={deleteNote}
        />

        <ResourceModal
          isOpen={isResourceModalOpen}
          subjects={subjects}
          topics={topics}
          defaultSubjectId={subject.id}
          onClose={() => setIsResourceModalOpen(false)}
          onSave={handleSaveResource}
        />
      </div>
    </MainLayout>
  );
}
